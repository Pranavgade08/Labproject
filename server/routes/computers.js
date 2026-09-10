const express = require('express');
const { exec } = require('child_process');
const Computer = require('../models/Computer');
const SystemLog = require('../models/SystemLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper to execute system commands safely
const executeCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: true, output: stderr || stdout || error.message });
      } else {
        resolve({ error: false, output: stdout });
      }
    });
  });
};

// @route   GET /api/computers
// @desc    Get all registered lab computers
// @access  Private (Admin / Assistant)
router.get('/', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const computers = await Computer.find().sort({ lastSeen: -1 });
    res.json({ success: true, count: computers.length, data: computers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/computers/:id
// @desc    Update computer lab designation / name
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { labNumber, name } = req.body;
    const computer = await Computer.findById(req.params.id);

    if (!computer) {
      return res.status(404).json({ success: false, message: 'Computer not found' });
    }

    if (labNumber !== undefined) computer.labNumber = labNumber.trim();
    if (name !== undefined) computer.name = name.trim();

    await computer.save();

    res.json({ success: true, message: 'Device updated successfully', data: computer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/computers/scan
// @desc    Scan LAN via ARP table and update active devices
// @access  Private
router.get('/scan', protect, async (req, res) => {
  try {
    const arpRes = await executeCommand('arp -a');
    const lines = (arpRes.output || '').split('\n');
    const discoveredDevices = [];

    for (const line of lines) {
      const match = line.match(/^\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+([0-9a-fA-F-]+)\s+(\w+)/);
      if (match) {
        const ip = match[1];
        const macRaw = match[2];
        const type = match[3];

        if (ip === '255.255.255.255' || ip.startsWith('224.') || ip.startsWith('239.')) {
          continue;
        }

        const macFormatted = macRaw.replace(/-/g, ':').toUpperCase();
        let os = 'Windows';
        let hostname = `PC-${ip.split('.').pop()}`;

        // Ping test to check if reachable & estimate TTL
        const pingRes = await executeCommand(`ping -n 1 -w 500 ${ip}`);
        let isOnline = false;

        if (!pingRes.error && pingRes.output.includes('TTL=')) {
          isOnline = true;
          const ttlMatch = pingRes.output.match(/TTL=(\d+)/i);
          if (ttlMatch) {
            const ttl = parseInt(ttlMatch[1], 10);
            if (ttl <= 64) os = 'Linux / Mac';
            else if (ttl <= 128) os = 'Windows';
            else os = 'Cisco / Network Device';
          }
        } else {
          os = 'Offline / Unreachable';
        }

        // Upsert into MongoDB
        const status = isOnline ? 'Online' : 'Offline';
        const existingComp = await Computer.findOne({ macAddress: macFormatted });

        if (existingComp) {
          existingComp.ipAddress = ip;
          existingComp.os = os !== 'Offline / Unreachable' ? os : existingComp.os;
          existingComp.status = status;
          existingComp.lastSeen = new Date();
          await existingComp.save();
          discoveredDevices.push(existingComp);
        } else {
          const newComp = await Computer.create({
            name: hostname,
            ipAddress: ip,
            macAddress: macFormatted,
            os: os !== 'Offline / Unreachable' ? os : 'Unknown',
            status,
            lastSeen: new Date(),
          });
          discoveredDevices.push(newComp);
        }
      }
    }

    // Mark PCs offline that haven't been seen in 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await Computer.updateMany(
      { lastSeen: { $lt: fifteenMinutesAgo } },
      { $set: { status: 'Offline' } }
    );

    res.json({ success: true, message: `Discovered ${discoveredDevices.length} network devices`, data: discoveredDevices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/computers/remote-action
// @desc    Trigger remote shutdown or restart for IP
// @access  Private (Admin / Assistant)
router.post('/remote-action', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const { targetIp, action } = req.body;

    if (!targetIp) {
      return res.status(400).json({ success: false, message: 'Target IP is required' });
    }

    const flag = action === 'restart' ? '/r' : '/s';
    const cmd = `shutdown ${flag} /m \\\\${targetIp} /t 0 /f`;
    const execRes = await executeCommand(cmd);

    await SystemLog.create({
      eventType: 'remote_action',
      details: `Action: ${action || 'shutdown'} on ${targetIp}. Result: ${execRes.output}`,
    });

    if (execRes.output.includes('Access is denied')) {
      return res.status(403).json({
        success: false,
        message: `Failed to ${action || 'shutdown'} ${targetIp}: Access Denied. Windows Administrator credentials required on target machine.`,
      });
    }

    res.json({
      success: true,
      message: `Command '${action || 'shutdown'}' dispatched to ${targetIp} successfully.`,
      output: execRes.output,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/computers/shutdown-all
// @desc    Trigger bulk remote shutdown for all active Windows machines
// @access  Private (Admin)
router.post('/shutdown-all', protect, authorize('admin'), async (req, res) => {
  try {
    const onlinePcs = await Computer.find({ status: 'Online', os: /Windows/i });
    let successCount = 0;
    let failCount = 0;

    for (const pc of onlinePcs) {
      const cmd = `shutdown /s /m \\\\${pc.ipAddress} /t 0 /f`;
      const execRes = await executeCommand(cmd);
      if (execRes.output.includes('Access is denied') || execRes.error) {
        failCount++;
      } else {
        successCount++;
      }
    }

    await SystemLog.create({
      eventType: 'remote_action',
      details: `Mass shutdown executed. Succeeded: ${successCount}, Failed: ${failCount}`,
    });

    res.json({
      success: true,
      message: `Mass shutdown command executed. Sent to ${successCount} devices. (${failCount} failed or access denied).`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
