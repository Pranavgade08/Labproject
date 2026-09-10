import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Monitor,
  LayoutDashboard,
  PlusCircle,
  Network,
  User,
  BarChart3,
  HardDrive,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isStudent, isAdmin, isSuperAdmin, pendingCount, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo-container">
        <div className="logo-badge">LT</div>
        <div>
          <div className="logo-text">LabTrack</div>
          <div className="logo-subtitle">Smart Lab Management</div>
        </div>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
          Home
        </NavLink>

        {!isAuthenticated ? (
          <>
            <NavLink to="/signup" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <UserPlus size={16} /> Student Signup
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <LogIn size={16} /> Student Login
            </NavLink>
            <NavLink to="/admin-login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Shield size={16} /> Admin
            </NavLink>
          </>
        ) : (
          <>
            {isStudent && (
              <>
                <NavLink to="/student/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
                <NavLink to="/student/report-issue" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <PlusCircle size={16} /> Report Issue
                </NavLink>
                <NavLink to="/network-management" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <Network size={16} /> Network
                </NavLink>
                <NavLink to="/student/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <User size={16} /> Profile
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <LayoutDashboard size={16} /> Admin Dashboard
                </NavLink>
                <NavLink to="/admin/monthly-reports" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <BarChart3 size={16} /> Reports
                </NavLink>
                <NavLink to="/network-management" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <Network size={16} /> Network
                </NavLink>
                <NavLink to="/admin/devices" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <HardDrive size={16} /> Devices
                </NavLink>
                {isSuperAdmin && (
                  <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <Settings size={16} /> Settings
                  </NavLink>
                )}
              </>
            )}
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="user-section">
          <div className="user-pill">
            <span>Hello, {user?.name || user?.identifier}</span>
            {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem' }} title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
