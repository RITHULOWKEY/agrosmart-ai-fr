import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45s for multi-agent pipeline
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrosmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and let AuthContext redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        localStorage.removeItem('agrosmart_token');
        localStorage.removeItem('agrosmart_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Farms endpoints
export const farmApi = {
  getFarms: () => api.get('/farms'),
  createFarm: (data) => api.post('/farms', data),
  getFarmById: (id) => api.get(`/farms/${id}`),
  updateFarm: (id, data) => api.put(`/farms/${id}`, data),
  saveBoundary: (id, data) => api.put(`/farms/${id}/boundary`, data),
  deleteBoundary: (id) => api.delete(`/farms/${id}/boundary`),
};

// Agents & Weather Intelligence endpoints
export const agentApi = {
  getWeather: (data) => api.post('/agents/weather', data),
  getFarmWeather: (farmId) => api.get(`/agents/weather/farm/${farmId}`),
  getCrop: (data) => api.post('/agents/crop', data),
  getSoil: (data) => api.post('/agents/soil', data),
  getMarket: (data) => api.post('/agents/market', data),
};

// Crop Analysis & Multi-Agent Pipeline endpoints
export const analysisApi = {
  createAnalysis: (formData, onProgress) =>
    api.post('/analysis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  getAnalyses: () => api.get('/analysis'),
  getAnalysisById: (id) => api.get(`/analysis/${id}`),
};

// Profile endpoints
export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export default api;
