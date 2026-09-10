import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI, computersAPI } from '../services/api';
import IssueDetailModal from '../components/IssueDetailModal';
import {
  Monitor,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart,
  Eye,
} from 'lucide-react';

const HomePage = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, activeLabs: 4, systemsOnline: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const issuesRes = await issuesAPI.getPublicRecent();
        if (issuesRes.data.success) {
          setRecentIssues(issuesRes.data.data);
        }

        // Summary stats
        const resolved = issuesRes.data.data.filter((i) => i.status === 'Resolved').length;
        const pending = issuesRes.data.data.filter((i) => i.status === 'Pending').length;
        setStats({
          total: issuesRes.data.data.length || 15,
          pending: pending || 4,
          resolved: resolved || 11,
          activeLabs: 4,
          systemsOnline: 128,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };

    loadHomeData();
  }, []);

  const openIssue = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section style={{ padding: '3.5rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
            <Sparkles size={16} /> Smart College Solution
          </span>
          <h1 style={{ fontSize: '2.75rem', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Modern Computer Lab Reporting & Remote Management System
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '2rem' }}>
            Report lab issues instantly with camera evidence. Track resolution transparently. Control and monitor lab network workstations effortlessly.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
              Student Portal <ArrowRight size={18} />
            </Link>
            <Link to="/admin-login" className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              Admin Console
            </Link>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '2rem', color: 'white', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: 'auto', fontWeight: 600 }}>LabTrack Live Console</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Active Labs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>4 Labs</div>
            </div>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Workstations Online</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>128 PCs</div>
            </div>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Avg Resolution</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#facc15' }}>1.2 Days</div>
            </div>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Remote Actions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>Instant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ margin: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Why LabTrack?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Student First</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Submit hardware, software, or network complaints in seconds with instant WebRTC camera evidence attachments.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Fast Resolution & Tracking</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time admin dashboard, bulk status updates, notification alerts, and automated elapsed days tracking.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <BarChart size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Network Remote Control</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              LAN ARP scanning, remote power commands (shutdown/restart), and monthly analytical audit reports.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Issues Gallery */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Recent Issue Reports</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Latest complaints registered across college laboratories</p>
          </div>
          <Link to="/login" className="btn btn-secondary">
            View All Issues
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="alert alert-info">No recent issues found. Start by submitting a report from the student portal.</div>
        ) : (
          <div className="gallery-grid">
            {recentIssues.map((issue, idx) => (
              <div key={issue._id || idx} className="gallery-card">
                <img
                  src={issue.photoPath || issue.hardwarePhotoPath || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80'}
                  alt={issue.issueType}
                  className="gallery-img"
                />
                <div className="gallery-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{issue.issueType}</span>
                    <span className={`status-badge status-${issue.status?.toLowerCase().replace(' ', '')}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', flex: 1 }}>
                    {issue.description.length > 60 ? `${issue.description.substring(0, 60)}...` : issue.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{issue.lab} {issue.systemNumber ? `(${issue.systemNumber})` : ''}</span>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => openIssue(issue)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <Eye size={15} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <IssueDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} issue={selectedIssue} />
    </div>
  );
};

export default HomePage;
