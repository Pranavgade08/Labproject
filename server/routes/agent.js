const express = require('express');
const Computer = require('../models/Computer');
const SystemLog = require('../models/SystemLog');

const router = express.Router();

// @route   POST /api/agent
// @desc    Receive heartbeat, software list, startup, shutdown events from PowerShell agent
// @access  Public (Agent Client)
router.post('/', async (req, res) => {
  try {
    const { action, mac_address, hostname, os, details, software } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    if (!action || !mac_address) {
      return res.status(400).json({ status: 'error', message: 'action and mac_address are required' });
    }

    const cleanMac = mac_address.replace(/-/g, ':').toUpperCase();

    // Find or create computer
    let computer = await Computer.findOne({ macAddress: cleanMac });
    if (!computer) {
      computer = await Computer.create({
        name: hostname || 'Lab PC',
        ipAddress: ip_address,
        macAddress: cleanMac,
        os: os || 'Windows',
        status: 'Online',
        lastSeen: new Date(),
      });
    } else {
      computer.ipAddress = ip_address;
      computer.name = hostname && hostname !== 'Unknown' ? hostname : computer.name;
      computer.os = os || computer.os;
      computer.status = 'Online';
      computer.lastSeen = new Date();
      await computer.save();
    }

    // Handle agent action
    switch (action) {
      case 'startup':
      case 'shutdown':
      case 'heartbeat':
      case 'error': {
        await SystemLog.create({
          computer: computer._id,
          macAddress: cleanMac,
          eventType: action,
          details: details || `Event ${action} triggered from ${hostname}`,
        });

        if (action === 'shutdown') {
          computer.status = 'Offline';
          await computer.save();
        }

        return res.json({ status: 'success', message: `Event '${action}' logged successfully` });
      }

      case 'software_report': {
        let softwareList = software;
        if (typeof software === 'string') {
          try {
            softwareList = JSON.parse(software);
          } catch (e) {
            softwareList = [];
          }
        }

        if (Array.isArray(softwareList)) {
          computer.installedSoftware = softwareList
            .filter((s) => s && s.name && s.name !== 'Unknown')
            .map((s) => ({
              name: s.name,
              version: s.version || 'Unknown',
            }));

          await computer.save();

          await SystemLog.create({
            computer: computer._id,
            macAddress: cleanMac,
            eventType: 'software_report',
            details: `Updated software list: ${computer.installedSoftware.length} items`,
          });

          return res.json({
            status: 'success',
            message: `Software list updated (${computer.installedSoftware.length} items)`,
          });
        }

        return res.status(400).json({ status: 'error', message: 'Invalid software list format' });
      }

      default:
        return res.status(400).json({ status: 'error', message: `Unknown action '${action}'` });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
