import axios from 'axios';

// Create axios instance with base URL from environment
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export const zoneAPI = {
  getZones: () => api.get('/api/zones'),
  getOfficers: () => api.get('/api/officers'),
  assignOfficer: (zoneId, officerId) =>
    api.post(`/api/zones/${zoneId}/assign`, { officerId }),
};

export const reportAPI = {
  getReports: (params) => api.get('/api/reports/queue', { params }),
  approveReport: (reportId) => api.post(`/api/reports/${reportId}/approve`),
  rejectReport: (reportId) => api.post(`/api/reports/${reportId}/reject`),
};

export const trafficAPI = {
  getSignals: () => api.get('/api/traffic/signals'),
  changeSignalPhase: (signalId, phase) =>
    api.post(`/api/traffic/signals/${signalId}/phase`, { phase }),
  toggleAmbulanceMode: (active) =>
    api.post('/api/traffic/ambulance-mode', { active }),
};

export const predictionAPI = {
  getActivePredictions: () => api.get('/api/predictions/active'),
};

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
};

export const settingsAPI = {
  getNotifications: () => api.get('/api/settings/notifications'),
  updateNotifications: (data) => api.put('/api/settings/notifications', data),
  getSystem: () => api.get('/api/settings/system'),
  updateSystem: (data) => api.put('/api/settings/system', data),
};

export default api;