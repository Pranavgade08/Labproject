import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    setCapturedBlob(null);
    setCapturedDataUrl(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please use standard file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedDataUrl(canvas.toDataURL('image/jpeg'));
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedDataUrl(null);
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '600px', background: '#0f172a', color: 'white' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="#38bdf8" /> Camera Capture
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          {cameraError ? (
            <div className="alert alert-error">{cameraError}</div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#1e293b', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!capturedDataUrl ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={capturedDataUrl}
                  alt="Captured snapshot"
                  style={{ width: '100%', maxHeight: '360px', objectFit: 'contain' }}
                />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!capturedDataUrl ? (
              <button onClick={handleCapture} className="btn btn-primary" disabled={!!cameraError}>
                <Camera size={18} /> Capture Photo
              </button>
            ) : (
              <>
                <button onClick={handleRetake} className="btn btn-secondary">
                  <RefreshCw size={18} /> Retake
                </button>
                <button onClick={handleConfirm} className="btn btn-success">
                  <Check size={18} /> Use This Photo
                </button>
              </>
            )}
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
