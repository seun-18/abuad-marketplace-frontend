import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';
import { getErrorMessage } from '../utils/errors';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore storage errors */
    }

    if (config.data instanceof FormData) {
      if (config.headers?.['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = typeof window !== 'undefined' ? window.location.pathname || '' : '';
    const isAuthPage =
      path.includes('/login') ||
      path.includes('/register') ||
      path.includes('/forgot-password') ||
      path.includes('/reset-password');

    if (status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        /* ignore */
      }
      if (typeof window !== 'undefined' && !isAuthPage) {
        const returnTo = encodeURIComponent(path + (window.location.search || ''));
        window.location.href = `/login?next=${returnTo}`;
      }
    }

    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);

export default api;
