import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('labtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  studentLogin: (data) => api.post('/auth/student-login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  logout: (data) => api.post('/auth/logout', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const issuesAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getPublicRecent: () => api.get('/issues/public-recent'),
  getStats: () => api.get('/issues/stats'),
  create: (formData) =>
    api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, data) => api.patch(`/issues/${id}/status`, data),
  bulkAction: (data) => api.post('/issues/bulk', data),
};

export const computersAPI = {
  getAll: () => api.get('/computers'),
  update: (id, data) => api.put(`/computers/${id}`, data),
  scan: () => api.get('/computers/scan'),
  remoteAction: (data) => api.post('/computers/remote-action', data),
  shutdownAll: () => api.post('/computers/shutdown-all'),
};

export const reportsAPI = {
  getMonthly: (month) => api.get('/reports/monthly', { params: { month } }),
};

export const notificationsAPI = {
  getUnread: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/mark-read'),
};

export default api;
