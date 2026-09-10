import React, { useState, useEffect } from 'react';
import { computersAPI } from '../services/api';
import { Network, RefreshCw, Power, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const NetworkManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const scanNetwork = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await computersAPI.scan();
      if (res.data.success) {
        setDevices(res.data.data);
        setMessage(res.data.message || 'LAN scan completed successfully.');
        setMessageType('success');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to complete network scan.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanNetwork();
  }, []);

  const handleRemoteAction = async (targetIp, action) => {
    if (!window.confirm(`Are you sure you want to send a remote ${action.toUpperCase()} command to ${targetIp}?`)) {
      return;
    }

    try {
      const res = await computersAPI.remoteAction({ targetIp, action });
      setMessage(res.data.message);
      setMessageType(res.data.success ? 'success' : 'error');
    } catch (err) {
      setMessage(err.response?.data?.message || `Failed to execute ${action} on ${targetIp}`);
      setMessageType('error');
    }
  };

  const handleShutdownAll = async () => {
    if (!window.confirm('CRITICAL WARNING: This will attempt to shutdown ALL active Windows PCs in the laboratory. Are you absolutely sure?')) {
      return;
    }

    try {
      const res = await computersAPI.shutdownAll();
      setMessage(res.data.message);
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to trigger mass shutdown');
      setMessageType('error');
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={24} color="#2563eb" /> Network Management
            </h2>
            <p className="card-subtitle">Detect active LAN computers and manage them remotely via Windows RPC</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={scanNetwork} className="btn btn-primary" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Scanning LAN...' : 'Rescan Network'}
            </button>
            <button onClick={handleShutdownAll} className="btn btn-danger">
              <Power size={16} /> Shutdown All PCs
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {messageType === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {message}
          </div>
        )}

        {/* Devices Table */}
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Estimated OS</th>
                <th>Status</th>
                <th>Remote Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    {loading ? 'Scanning ARP cache...' : 'No active network devices detected. Click "Rescan Network".'}
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isOffline = device.status === 'Offline';
                  return (
                    <tr key={device._id || device.macAddress}>
                      <td>
                        <strong>{device.name || 'Unknown Host'}</strong>
                      </td>
                      <td>
                        <code>{device.ipAddress}</code>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#475569' }}>{device.macAddress}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${device.os?.includes('Windows') ? 'status-progress' : 'status-pending'}`}>
                          {device.os || 'Windows'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${device.status?.toLowerCase()}`}>
                          {device.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleRemoteAction(device.ipAddress, 'shutdown')}
                            className="btn btn-danger"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            disabled={isOffline}
                            title="Shutdown Remote PC"
                          >
                            <Power size={12} /> Shutdown
                          </button>
                          <button
                            onClick={() => handleRemoteAction(device.ipAddress, 'restart')}
                            className="btn btn-warning"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            disabled={isOffline}
                            title="Restart Remote PC"
                          >
                            <RotateCcw size={12} /> Restart
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Requirements Box */}
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: '8px' }}>
          <h4 style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={18} /> Requirements for Remote Workstation Actions
          </h4>
          <ul style={{ color: '#92400e', fontSize: '0.85rem', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li>Target workstation must have <strong>File and Printer Sharing</strong> enabled.</li>
            <li>The <strong>Remote Registry</strong> service must be running on the target machine.</li>
            <li>The Node.js server executing this command must have domain or local Administrator privileges.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NetworkManagementPage;
