import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  withCredentials: true
});

export const Api = {
  // Database operations
  toggleDB: (type) => api.post('/api/db/switch', { type }),
  getDatabaseType: () => api.get('/api/db/type'),

  // Auth operations
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  resetPassword: (email) => api.post('/api/auth/reset-password', { email }),

  // User operations
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  generateApiKey: () => api.post('/api/users/api-key'),
  revokeApiKey: () => api.delete('/api/users/api-key'),

  // Product operations
  getProducts: (params) => api.get('/api/products', { params }),
  getProduct: (id) => api.get(`/api/products/${id}`),

  // File operations
  uploadFile: (formData) => api.post('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFiles: () => api.get('/api/files'),

  // Progress tracking
  getProgress: () => api.get('/api/progress/summary'),
  markVulnerabilityComplete: (data) => api.post('/api/progress/complete', data),
  resetProgress: () => api.post('/api/progress/reset'),

  // Feedback
  submitFeedback: (data) => api.post('/api/feedback', data)
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