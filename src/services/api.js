import axios from 'axios';

/**
 * Resolves the dynamic backend API base URL.
 * Automatically ensures the '/api' prefix is present and trims trailing slashes.
 * Works seamlessly in both local development and production static hosting.
 */
export const getBaseURL = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

  if (backendUrl) {
    const trimmed = backendUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Default fallback: direct to localhost:5000 in dev, or relative /api in prod
  return import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
};

export const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP-only cookies with cross-origin requests
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
    // If 401 and not an auth check, clean up local token
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      if (
        !requestUrl.includes('/auth/login') &&
        !requestUrl.includes('/auth/register') &&
        !requestUrl.includes('/auth/forgot-password')
      ) {
        localStorage.removeItem('khata_token');
        localStorage.removeItem('khata_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
