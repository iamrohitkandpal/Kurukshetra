import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const Api = {
  // Database operations
  toggleDB: (type) => api.post('/api/db/switch', { type }),
  getDatabaseType: () => api.get('/api/db/type'),

  // Auth operations
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  resetPassword: (email) => api.post('/api/auth/reset-password', { email }),

  // User operations with db param
  getProfile: () => {
    const dbType = localStorage.getItem('dbType');
    return api.get('/api/users/profile', { params: { db: dbType } });
  },
  updateProfile: (data) => {
    const dbType = localStorage.getItem('dbType');
    return api.put('/api/users/profile', data, { params: { db: dbType } });
  },

  // Product operations with db param
  getProducts: (params = {}) => {
    const dbType = localStorage.getItem('dbType');
    return api.get('/api/products', { params: { ...params, db: dbType } });
  },
  getProduct: (id, params = {}) => {
    const dbType = localStorage.getItem('dbType');
    return api.get(`/api/products/${id}`, { params: { ...params, db: dbType } });
  },

  // Progress tracking with db param
  getProgress: (params = {}) => {
    const dbType = localStorage.getItem('dbType');
    return api.get('/api/progress/summary', { params: { ...params, db: dbType } });
  },
  markVulnerabilityComplete: (data) => {
    const dbType = localStorage.getItem('dbType');
    return api.post('/api/progress/complete', data, { params: { db: dbType } });
  },
  resetProgress: () => {
    const dbType = localStorage.getItem('dbType');
    return api.post('/api/progress/reset', {}, { params: { db: dbType } });
  },

  // Feedback with db param
  submitFeedback: (data) => {
    const dbType = localStorage.getItem('dbType');
    return api.post('/api/feedback', data, { params: { db: dbType } });
  }
};

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  response => response,
  error => {
    const errorData = error.response?.data?.error || { 
      message: error.message, 
      code: 'UNKNOWN_ERROR' 
    };
    
    console.error(`API Error: ${errorData.message} (${errorData.code})`);
    return Promise.reject(errorData);
  }
);

export default Api;