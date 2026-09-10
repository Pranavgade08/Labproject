import React from 'react';
import { X, Calendar, MapPin, Monitor, Tag, AlertCircle } from 'lucide-react';

const IssueDetailModal = ({ isOpen, onClose, issue }) => {
  if (!isOpen || !issue) return null;

  const photo = issue.photoPath || issue.hardwarePhotoPath;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#1e40af' }}>Issue Details</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {photo && (
            <div style={{ marginBottom: '1.25rem', borderRadius: '10px', overflow: 'hidden', maxHeight: '250px', background: '#f1f5f9' }}>
              <img src={photo} alt="Issue evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} /> Location / Lab
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>{issue.lab}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Monitor size={14} /> System Number
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>{issue.systemNumber || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={14} /> Issue Type
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>{issue.issueType}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> Reported On
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
                {new Date(issue.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
              Description:
            </label>
            <p style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem' }}>
              {issue.description}
            </p>
          </div>

          {issue.adminNotes && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Admin Notes:
              </label>
              <p style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.95rem' }}>
                {issue.adminNotes}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span className={`status-badge status-${issue.status?.toLowerCase().replace(' ', '')}`}>
              {issue.status}
            </span>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
