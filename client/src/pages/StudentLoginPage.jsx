import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, UserCheck, AlertCircle } from 'lucide-react';

const StudentLoginPage = () => {
  const [prn, setPrn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginStudent(prn, password);
      if (res.success) {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your PRN and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: '440px', margin: '3rem auto' }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserCheck size={24} />
          </div>
          <h2 className="card-title">Student Login</h2>
          <p className="card-subtitle">Access your lab complaints and reporting history</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="alert alert-info" style={{ fontSize: '0.825rem' }}>
          <strong>Demo Student:</strong> PRN: <code>PRN001</code> / Pass: <code>password123</code>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">PRN / Student ID *</label>
            <input
              type="text"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              className="form-control"
              placeholder="e.g. PRN001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          New student?{' '}
          <Link to="/signup" style={{ fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
