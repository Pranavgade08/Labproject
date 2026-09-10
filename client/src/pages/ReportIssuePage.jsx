import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CameraModal from '../components/CameraModal';
import { Camera, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const ReportIssuePage = () => {
  const { user, refreshPendingCount } = useAuth();
  const navigate = useNavigate();

  const [lab, setLab] = useState('Lab 1');
  const [systemNumber, setSystemNumber] = useState('');
  const [issueType, setIssueType] = useState('Hardware Issue');
  const [description, setDescription] = useState('');
  const [issuePhoto, setIssuePhoto] = useState(null);
  const [hardwarePhoto, setHardwarePhoto] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState('general'); // 'general' or 'hardware'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenCam = (target) => {
    setCameraTarget(target);
    setIsCameraOpen(true);
  };

  const handleCameraCapture = (file) => {
    if (cameraTarget === 'general') {
      setIssuePhoto(file);
    } else {
      setHardwarePhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('lab', lab);
      formData.append('systemNumber', systemNumber);
      formData.append('issueType', issueType);
      formData.append('description', description);

      if (issuePhoto) formData.append('issuePhoto', issuePhoto);
      if (hardwarePhoto) formData.append('hardwarePhoto', hardwarePhoto);

      const res = await issuesAPI.create(formData);
      if (res.data.success) {
        setSuccess('Issue reported successfully!');
        refreshPendingCount();
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: '600px', margin: '1rem auto' }}>
        <div className="card-header">
          <h2 className="card-title">Report Lab Issue</h2>
          <p className="card-subtitle">Submit a detailed complaint with photo evidence</p>
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
            <label className="form-label">Student PRN</label>
            <input type="text" className="form-control" value={user?.identifier || ''} readOnly disabled style={{ background: '#f1f5f9' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Lab *</label>
              <select value={lab} onChange={(e) => setLab(e.target.value)} className="form-control" required>
                <option value="Lab 1">Lab 1</option>
                <option value="Lab 2">Lab 2</option>
                <option value="Lab 3">Lab 3</option>
                <option value="Lab 4">Lab 4</option>
                <option value="Computer Center">Computer Center</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">System Number (Optional)</label>
              <input
                type="text"
                value={systemNumber}
                onChange={(e) => setSystemNumber(e.target.value)}
                className="form-control"
                placeholder="e.g. PC-01, SYS-101"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Type *</label>
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="form-control" required>
              <option value="Hardware Issue">Hardware Issue</option>
              <option value="Software Issue">Software Issue</option>
              <option value="Network Issue">Network Issue</option>
              <option value="Peripheral Issue">Peripheral Issue (Mouse, Keyboard)</option>
              <option value="Internet Issue">Internet Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          {/* Photo attachments */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: '#1e293b' }}>
              Photo Evidence (Optional)
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">General Issue Photo</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIssuePhoto(e.target.files[0])}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => handleOpenCam('general')} className="btn btn-secondary" title="Take Photo">
                  <Camera size={16} /> Cam
                </button>
              </div>
              {issuePhoto && <small style={{ color: '#10b981', display: 'block', marginTop: '4px' }}>Selected: {issuePhoto.name}</small>}
            </div>

            <div>
              <label className="form-label">Hardware Specific Photo</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHardwarePhoto(e.target.files[0])}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => handleOpenCam('hardware')} className="btn btn-secondary" title="Take Photo">
                  <Camera size={16} /> Cam
                </button>
              </div>
              {hardwarePhoto && <small style={{ color: '#10b981', display: 'block', marginTop: '4px' }}>Selected: {hardwarePhoto.name}</small>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <Upload size={18} /> {loading ? 'Submitting Report...' : 'Submit Issue'}
          </button>
        </form>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default ReportIssuePage;
