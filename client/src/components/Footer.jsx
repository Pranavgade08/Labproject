import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>LabTrack</strong> &copy; {new Date().getFullYear()} Modern Computer Lab Reporting & Remote Management System.
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Developed with MERN Stack • React + Express + MongoDB
        </div>
      </div>
    </footer>
  );
};

export default Footer;
