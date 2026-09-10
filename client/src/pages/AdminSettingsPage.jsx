import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Settings, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminSettingsPage = () => {
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
        setSuccess('Admin password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={22} color="#2563eb" /> Admin Settings
            </h2>
            <p className="card-subtitle">Manage administrative configuration and master authentication</p>
          </div>

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

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Admin Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-control"
                placeholder="Enter current password"
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
                placeholder="Re-type new password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <Lock size={16} /> {loading ? 'Updating Password...' : 'Update Admin Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
