import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentProfilePage = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        {/* Profile Details Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="#2563eb" /> Personal Details
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Full Name</label>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '4px' }}>{user?.name}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>PRN / Student ID</label>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '4px', color: '#2563eb' }}>{user?.identifier}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Class</label>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '4px' }}>{user?.class || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Roll Number</label>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '4px' }}>{user?.rollno || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Academic Year</label>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '4px' }}>{user?.year || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={22} color="#2563eb" /> Security: Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
