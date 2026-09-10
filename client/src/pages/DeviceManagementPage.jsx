import React, { useState, useEffect } from 'react';
import { computersAPI } from '../services/api';
import { HardDrive, Edit, X, CheckCircle2, AlertCircle, Package } from 'lucide-react';

const DeviceManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [labNumber, setLabNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await computersAPI.getAll();
      if (res.data.success) {
        setDevices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openEdit = (dev) => {
    setSelectedDevice(dev);
    setLabNumber(dev.labNumber || '');
    setDeviceName(dev.name || '');
    setEditModalOpen(true);
  };

  const openSoftware = (dev) => {
    setSelectedDevice(dev);
    setSoftwareModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDevice) return;

    try {
      const res = await computersAPI.update(selectedDevice._id, {
        labNumber,
        name: deviceName,
      });

      if (res.data.success) {
        setMessage('Device designation updated successfully.');
        setEditModalOpen(false);
        fetchDevices();
      }
    } catch (err) {
      alert('Error updating device.');
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardDrive size={24} color="#2563eb" /> Device & Asset Management
          </h2>
          <p className="card-subtitle">Manage registered lab computers, assign laboratory rooms, and inspect installed software</p>
        </div>

        {message && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading workstations...</div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>IP Address</th>
                  <th>MAC Address</th>
                  <th>Lab Designation</th>
                  <th>OS</th>
                  <th>Status</th>
                  <th>Software</th>
                  <th>Last Seen</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No devices registered. Scan LAN or deploy the PowerShell agent on lab PCs.
                    </td>
                  </tr>
                ) : (
                  devices.map((dev) => (
                    <tr key={dev._id}>
                      <td>
                        <strong>{dev.name}</strong>
                      </td>
                      <td>{dev.ipAddress}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace' }}>{dev.macAddress}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                          {dev.labNumber || 'Unassigned'}
                        </span>
                      </td>
                      <td>{dev.os}</td>
                      <td>
                        <span className={`status-badge status-${dev.status?.toLowerCase()}`}>
                          {dev.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => openSoftware(dev)}
                          className="btn btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        >
                          <Package size={12} /> {dev.installedSoftware?.length || 0} apps
                        </button>
                      </td>
                      <td>{new Date(dev.lastSeen).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => openEdit(dev)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1e40af' }}>Edit Device Assignment</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Computer Name / Hostname</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lab Number / Designation</label>
                <input
                  type="text"
                  value={labNumber}
                  onChange={(e) => setLabNumber(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Lab 1, Server Room"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Installed Software Modal */}
      {softwareModalOpen && selectedDevice && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1e40af' }}>
                Installed Software: {selectedDevice.name}
              </h3>
              <button onClick={() => setSoftwareModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {!selectedDevice.installedSoftware || selectedDevice.installedSoftware.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No software catalog received from client agent yet.
                </div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Application Name</th>
                      <th>Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDevice.installedSoftware.map((sw, idx) => (
                      <tr key={idx}>
                        <td><strong>{sw.name}</strong></td>
                        <td><code>{sw.version}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
              <button onClick={() => setSoftwareModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagementPage;
