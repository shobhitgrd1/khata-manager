import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send HTTP-only cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('khata_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not an auth check, we can clean up local token
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected routes, we can handle token clearing
      if (
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/register') &&
        !error.config.url.includes('/auth/forgot-password')
      ) {
        localStorage.removeItem('khata_token');
        localStorage.removeItem('khata_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

