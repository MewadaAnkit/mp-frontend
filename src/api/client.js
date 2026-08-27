import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mp_rms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/public') && !window.location.pathname.startsWith('/result/verify')) {
        localStorage.removeItem('mp_rms_token');
        localStorage.removeItem('mp_rms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
