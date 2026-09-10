import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, issuesAPI, notificationsAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async (currentUser) => {
    try {
      if (!currentUser) return;
      if (currentUser.role === 'student') {
        const res = await issuesAPI.getAll({ status: 'Pending' });
        setPendingCount(res.data.count || 0);
      } else {
        const res = await issuesAPI.getStats();
        setPendingCount(res.data.stats?.pending || 0);
      }
    } catch (err) {
      console.error('Error fetching pending counts:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('labtrack_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            fetchPendingCount(res.data.user);
          }
        } catch (err) {
          localStorage.removeItem('labtrack_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginStudent = async (prn, password) => {
    const res = await authAPI.studentLogin({ prn, password });
    if (res.data.success) {
      localStorage.setItem('labtrack_token', res.data.token);
      if (res.data.sessionId) {
        localStorage.setItem('labtrack_session_id', res.data.sessionId);
      }
      setUser(res.data.user);
      fetchPendingCount(res.data.user);
    }
    return res.data;
  };

  const loginAdmin = async (username, password) => {
    const res = await authAPI.adminLogin({ username, password });
    if (res.data.success) {
      localStorage.setItem('labtrack_token', res.data.token);
      setUser(res.data.user);
      fetchPendingCount(res.data.user);
    }
    return res.data;
  };

  const signupStudent = async (formData) => {
    const res = await authAPI.signup(formData);
    if (res.data.success) {
      localStorage.setItem('labtrack_token', res.data.token);
      setUser(res.data.user);
      fetchPendingCount(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    const sessionId = localStorage.getItem('labtrack_session_id');
    try {
      if (sessionId) {
        await authAPI.logout({ sessionId });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('labtrack_token');
      localStorage.removeItem('labtrack_session_id');
      setUser(null);
      setPendingCount(0);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingCount,
        refreshPendingCount: () => fetchPendingCount(user),
        loginStudent,
        loginAdmin,
        signupStudent,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin' || user?.role === 'assistant',
        isSuperAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
