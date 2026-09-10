import React, { useState, useEffect } from 'react';
import { issuesAPI, computersAPI, notificationsAPI } from '../services/api';
import IssueDetailModal from '../components/IssueDetailModal';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Monitor,
  Bell,
  Download,
  Filter,
  Eye,
  Edit3,
  X,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0, total: 0 });
  const [pcStats, setPcStats] = useState({ online: 0, offline: 0, total: 0 });
  const [notifications, setNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [adminNotes, setAdminNotes] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailIssue, setDetailIssue] = useState(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Issues
      const issuesRes = await issuesAPI.getAll({ status: statusFilter });
      if (issuesRes.data.success) {
        setIssues(issuesRes.data.data);
      }

      // 2. Stats
      const statsRes = await issuesAPI.getStats();
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // 3. Computers count
      const compsRes = await computersAPI.getAll();
      if (compsRes.data.success) {
        const comps = compsRes.data.data;
        const online = comps.filter((c) => c.status === 'Online').length;
        setPcStats({ online, offline: comps.length - online, total: comps.length });
      }

      // 4. Notifications
      const notifRes = await notificationsAPI.getUnread();
      if (notifRes.data.success) {
        setNotifications(notifRes.data.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleMarkNotifRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications([]);
      setMessage('All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  };

  const openUpdate = (issue) => {
    setActiveIssue(issue);
    setNewStatus(issue.status);
    setAdminNotes(issue.adminNotes || '');
    setUpdateModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeIssue) return;

    try {
      const res = await issuesAPI.updateStatus(activeIssue._id, {
        status: newStatus,
        adminNotes,
      });
      if (res.data.success) {
        setMessage('Issue updated successfully!');
        setUpdateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Error updating issue status.');
    }
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIssues(issues.map((i) => i._id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIssues.includes(id)) {
      setSelectedIssues(selectedIssues.filter((i) => i !== id));
    } else {
      setSelectedIssues([...selectedIssues, id]);
    }
  };

  const handleApplyBulk = async (e) => {
    e.preventDefault();
    if (!bulkAction || selectedIssues.length === 0) return;

    if (!window.confirm(`Are you sure you want to apply '${bulkAction}' to ${selectedIssues.length} issue(s)?`)) {
      return;
    }

    try {
      const res = await issuesAPI.bulkAction({
        action: bulkAction,
        ids: selectedIssues,
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setSelectedIssues([]);
        setBulkAction('');
        fetchData();
      }
    } catch (err) {
      alert('Error applying bulk action.');
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/issues/export-csv';
  };

  return (
    <div className="main-content">
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b' }}>Manage and track all laboratory issues & workstation infrastructure</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ background: '#10b981', color: 'white', border: 'none' }}>
            <Download size={16} /> Export to CSV
          </button>
          <button onClick={fetchData} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-header">
            <span className="stat-title">Pending Issues</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          <div className="stat-desc">Awaiting action</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-header">
            <span className="stat-title">In Progress</span>
            <Clock size={18} color="#3b82f6" />
          </div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.inProgress}</div>
          <div className="stat-desc">Under maintenance</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-header">
            <span className="stat-title">Resolved</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
          <div className="stat-desc">Issues fixed</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <div className="stat-header">
            <span className="stat-title">Online PCs</span>
            <Monitor size={18} color="#06b6d4" />
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>{pcStats.online}</div>
          <div className="stat-desc">of {pcStats.total} registered</div>
        </div>
      </div>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Bell size={18} /> Notifications ({notifications.length} unread)
            </h4>
            <button onClick={handleMarkNotifRead} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              Mark all read
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map((n) => (
              <div key={n._id} style={{ fontSize: '0.875rem', color: '#1e3a8a', borderBottom: '1px dashed #dbeafe', paddingBottom: '0.4rem' }}>
                <strong>{n.title}</strong>: {n.message}
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginLeft: '0.75rem' }}>
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Bulk Actions Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="#64748b" />
          <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
          >
            <option value="All">All Issues</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <form onSubmit={handleApplyBulk} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Selected: {selectedIssues.length}
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
          >
            <option value="">Choose bulk action...</option>
            <option value="resolve">Mark as Resolved</option>
            <option value="delete">Delete Issues</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem' }} disabled={selectedIssues.length === 0 || !bulkAction}>
            Apply
          </button>
        </form>
      </div>

      {/* Main Issue Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading issues...</div>
        ) : issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No issues found matching filter.</h3>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      onChange={handleToggleSelectAll}
                      checked={selectedIssues.length === issues.length && issues.length > 0}
                    />
                  </th>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Class / Roll</th>
                  <th>Lab / System</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Photos</th>
                  <th>Status</th>
                  <th>Days</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((row) => (
                  <tr key={row._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(row._id)}
                        onChange={() => handleToggleSelect(row._id)}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#64748b' }}>#{row._id.substring(row._id.length - 5)}</span>
                    </td>
                    <td>
                      <strong>{row.student?.name || 'Student'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.prn}</div>
                    </td>
                    <td>
                      {row.student?.class || 'N/A'}
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Roll: {row.student?.rollno || '-'}</div>
                    </td>
                    <td>
                      <strong>{row.lab}</strong>
                      {row.systemNumber && (
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                          {row.systemNumber}
                        </div>
                      )}
                    </td>
                    <td>{row.issueType}</td>
                    <td>
                      {row.description.length > 35 ? `${row.description.substring(0, 35)}...` : row.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {row.photoPath && (
                          <a href={row.photoPath} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '11px' }}>
                            📸
                          </a>
                        )}
                        {row.hardwarePhotoPath && (
                          <a href={row.hardwarePhotoPath} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '11px' }}>
                            🔧
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${row.status?.toLowerCase().replace(' ', '')}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{row.daysDisplay}d</span>
                    </td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setDetailIssue(row);
                            setDetailModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 6px' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openUpdate(row)}
                          className="btn btn-primary"
                          style={{ padding: '4px 6px' }}
                          title="Update Status"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {updateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1e40af' }}>Update Issue Status</h3>
              <button onClick={() => setUpdateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="form-control" required>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Notes / Resolution Details</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-control"
                  rows={4}
                  placeholder="Notes about parts replaced, technician assigned, or test result..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setUpdateModalOpen(false)} className="btn btn-secondary">
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

      <IssueDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} issue={detailIssue} />
    </div>
  );
};

export default AdminDashboardPage;
