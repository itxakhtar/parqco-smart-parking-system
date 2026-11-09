import axios from 'axios';

// In development the Vite dev server proxies "/api" to the backend, so VITE_API_URL stays empty.
// In production set VITE_API_URL to the public address of the backend (no trailing slash).
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// One configured axios instance. Every request automatically carries the login token.
const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parqco_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
