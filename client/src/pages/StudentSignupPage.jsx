import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const StudentSignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    prn: '',
    password: '',
    class: 'B.Sc IT',
    rollno: '',
    year: 'Second Year',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signupStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await signupStudent(formData);
      if (res.success) {
        setSuccess('Registration successful! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserPlus size={24} />
          </div>
          <h2 className="card-title">Student Registration</h2>
          <p className="card-subtitle">Register to track and report computer lab problems</p>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PRN / Student ID *</label>
            <input
              type="text"
              name="prn"
              value={formData.prn}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. PRN004"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Class *</label>
              <select name="class" value={formData.class} onChange={handleChange} className="form-control" required>
                <option value="B.Sc IT">B.Sc IT</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc CS">B.Sc CS</option>
                <option value="B.Tech">B.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g. 14"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year *</label>
            <select name="year" value={formData.year} onChange={handleChange} className="form-control" required>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentSignupPage;
