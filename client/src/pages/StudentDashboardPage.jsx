import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import IssueDetailModal from '../components/IssueDetailModal';
import { PlusCircle, Printer, Eye, AlertCircle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const StudentDashboardPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issuesAPI.getAll();
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      setError('Failed to load your submitted issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  return (
    <div className="main-content">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="card-title">My Submitted Issues</h2>
            <p className="card-subtitle">You have submitted {issues.length} issue(s)</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }} className="no-print">
            <button onClick={() => window.print()} className="btn btn-secondary">
              <Printer size={16} /> Print Report
            </button>
            <Link to="/student/report-issue" className="btn btn-primary">
              <PlusCircle size={16} /> Report New Issue
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading your issues...</div>
        ) : issues.length === 0 ? (
          <div className="alert alert-info" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#1e40af' }}>No Issues Submitted Yet</h3>
            <p style={{ marginBottom: '1.5rem', color: '#3b82f6' }}>You haven't reported any laboratory equipment issues yet.</p>
            <Link to="/student/report-issue" className="btn btn-primary">
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lab / System</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Photos</th>
                  <th>Status</th>
                  <th>Days</th>
                  <th>Date</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#64748b' }}>#{row._id.substring(row._id.length - 5)}</span>
                    </td>
                    <td>
                      <strong>{row.lab}</strong>
                      {row.systemNumber && (
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '2px' }}>
                          {row.systemNumber}
                        </div>
                      )}
                    </td>
                    <td>{row.issueType}</td>
                    <td>
                      {row.description.length > 40 ? `${row.description.substring(0, 40)}...` : row.description}
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
                        {!row.photoPath && !row.hardwarePhotoPath && (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${row.status?.toLowerCase().replace(' ', '')}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{row.daysDisplay} day(s)</span>
                    </td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="no-print">
                      <button onClick={() => openIssueModal(row)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IssueDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} issue={selectedIssue} />
    </div>
  );
};

export default StudentDashboardPage;
