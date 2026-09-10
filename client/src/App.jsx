import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentSignupPage from './pages/StudentSignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ReportIssuePage from './pages/ReportIssuePage';
import StudentProfilePage from './pages/StudentProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MonthlyReportsPage from './pages/MonthlyReportsPage';
import NetworkManagementPage from './pages/NetworkManagementPage';
import DeviceManagementPage from './pages/DeviceManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Protected Route wrappers
const ProtectedStudentRoute = ({ children }) => {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading session...</div>;
  if (!user || !isStudent) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading session...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin-login" replace />;
  return children;
};

const ProtectedGeneralRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<StudentLoginPage />} />
            <Route path="/signup" element={<StudentSignupPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* Student Protected */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedStudentRoute>
                  <StudentDashboardPage />
                </ProtectedStudentRoute>
              }
            />
            <Route
              path="/student/report-issue"
              element={
                <ProtectedStudentRoute>
                  <ReportIssuePage />
                </ProtectedStudentRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedStudentRoute>
                  <StudentProfilePage />
                </ProtectedStudentRoute>
              }
            />

            {/* Admin Protected */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/monthly-reports"
              element={
                <ProtectedAdminRoute>
                  <MonthlyReportsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/devices"
              element={
                <ProtectedAdminRoute>
                  <DeviceManagementPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedAdminRoute>
                  <AdminSettingsPage />
                </ProtectedAdminRoute>
              }
            />

            {/* General Protected (Both Student and Admin) */}
            <Route
              path="/network-management"
              element={
                <ProtectedGeneralRoute>
                  <NetworkManagementPage />
                </ProtectedGeneralRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
