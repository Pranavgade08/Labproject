import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { BarChart3, Printer, Calendar, AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react';

const MonthlyReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyReport = async (month) => {
    setLoading(true);
    try {
      const res = await reportsAPI.getMonthly(month);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="main-content">
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>📊 Monthly Issue Report</h1>
          <p style={{ color: '#64748b' }}>
            Comprehensive analytics & equipment performance audits for {selectedMonth}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#64748b" />
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="form-control"
              style={{ width: 'auto' }}
            />
          </div>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Generating monthly report...</div>
      ) : !reportData ? (
        <div className="alert alert-error">Failed to generate report.</div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="stat-header">
                <span className="stat-title">Total Issues</span>
                <Layers size={18} color="#3b82f6" />
              </div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>{reportData.summary.total}</div>
              <div className="stat-desc">Reported in {selectedMonth}</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="stat-header">
                <span className="stat-title">Pending</span>
                <AlertTriangle size={18} color="#f59e0b" />
              </div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>{reportData.summary.pending}</div>
              <div className="stat-desc">Awaiting resolution</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="stat-header">
                <span className="stat-title">Resolved</span>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div className="stat-value" style={{ color: '#10b981' }}>{reportData.summary.resolved}</div>
              <div className="stat-desc">Successfully fixed</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="stat-header">
                <span className="stat-title">Avg. Resolution Time</span>
                <Clock size={18} color="#8b5cf6" />
              </div>
              <div className="stat-value" style={{ color: '#8b5cf6' }}>{reportData.summary.avgResolutionDays} days</div>
              <div className="stat-desc">Turnaround time</div>
            </div>
          </div>

          {/* Visual Bar Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Issues by Lab */}
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', color: '#0284c7' }}>Issues by Laboratory</h3>
              {reportData.labDistribution.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>No data for this month</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reportData.labDistribution.map((item) => {
                    const pct = Math.round((item.count / Math.max(1, reportData.summary.total)) * 100);
                    return (
                      <div key={item.lab}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                          <strong>{item.lab}</strong>
                          <span style={{ color: '#64748b' }}>{item.count} issues ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #0284c7)', borderRadius: '9999px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Issues by Type */}
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', color: '#7c3aed' }}>Issues by Category</h3>
              {reportData.typeDistribution.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>No data for this month</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reportData.typeDistribution.map((item) => {
                    const pct = Math.round((item.count / Math.max(1, reportData.summary.total)) * 100);
                    return (
                      <div key={item.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                          <strong>{item.type}</strong>
                          <span style={{ color: '#64748b' }}>{item.count} issues ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #7c3aed)', borderRadius: '9999px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>Detailed Incident Logs</h3>
            </div>
            {reportData.issues.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No incidents recorded in this month.</div>
            ) : (
              <div className="table-responsive" style={{ border: 'none' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Lab</th>
                      <th>System</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Reported</th>
                      <th>Admin Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.issues.map((issue) => (
                      <tr key={issue._id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>#{issue._id.substring(issue._id.length - 5)}</span>
                        </td>
                        <td>
                          <strong>{issue.student?.name || 'Student'}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{issue.prn}</div>
                        </td>
                        <td>{issue.lab}</td>
                        <td>{issue.systemNumber || '-'}</td>
                        <td>{issue.issueType}</td>
                        <td>
                          <span className={`status-badge status-${issue.status?.toLowerCase().replace(' ', '')}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                        <td style={{ maxWidth: '250px', fontSize: '0.8rem', color: '#475569' }}>
                          {issue.adminNotes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReportsPage;
