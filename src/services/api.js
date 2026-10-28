import axios from 'axios';

const rawBaseUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://pharmacy-bill-backend.onrender.com'
)
  .trim()
  .replace(/\/+$/, '');

const BASE_URL = import.meta.env.DEV
  ? '/api'
  : rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : `${rawBaseUrl}/api`;

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories API
export const categoriesApi = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Items / Inventory API
export const itemsApi = {
  getAll: (params) => API.get('/items', { params }),
  getById: (id) => API.get(`/items/${id}`),
  create: (data) => API.post('/items', data),
  update: (id, data) => API.put(`/items/${id}`, data),
  delete: (id) => API.delete(`/items/${id}`),
  adjustStock: (id, data) => API.post(`/items/${id}/adjust-stock`, data),
  getAlerts: () => API.get('/items/alerts/summary'),
};

// Invoices / Billing API
export const invoicesApi = {
  getAll: (params) => API.get('/invoices', { params }),
  getById: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post('/invoices', data),
  delete: (id) => API.delete(`/invoices/${id}`),
  getNextNumber: () => API.get('/invoices/next-number'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => API.get('/dashboard/stats'),
};

// Settings API
export const settingsApi = {
  get: () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};

// Seed API
export const seedApi = {
  seed: (force = false) => API.post(`/seed?force=${force}`),
};

export default API;
