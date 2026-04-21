/**
 * utils/api.js - Centralized Axios instance with interceptors
 * Fully dynamic using .env (supports local + production)
 */

import axios from 'axios';

// 🔥 Resolve base URL dynamically
const resolveApiBase = () => {
  const base = import.meta.env.VITE_API_URL;

  if (!base) return '/api';

  const cleanBase = base.replace(/\/$/, '');

  // ✅ If already /api (local), don't append again
  if (cleanBase.endsWith('/api')) {
    return cleanBase;
  }

  return `${cleanBase}/api`;
};

// 🔥 Create Axios instance
const api = axios.create({
  baseURL: resolveApiBase(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin')
    ) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ─── API METHODS ─────────────────────────────────────────────

export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export const healthAPI = {
  ping: () => api.get('/health'),
};

export const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL || '/api';
  const cleanBase = base.replace(/\/$/, '');
  return cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/admin/profile', data),
  deleteAsset: (type) => api.delete(`/admin/profile/assets/${type}`),

  uploadPicture: (file) => {
    const form = new FormData();
    form.append('profileImage', file);
    return api.post('/admin/profile/assets', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/admin/profile/assets', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const blogAPI = {
  getAll: (params = {}) => api.get('/blogs', { params }),
  getBySlug: (slug) => api.get(`/blogs/${slug}`),
};

export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me'),

  getProjects: (params = {}) => api.get('/projects', { params }),
  createProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  getMessages: (params = {}) => api.get('/admin/messages', { params }),
  markAsRead: (id) => api.patch(`/admin/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),

  getBlogs: (params = {}) => api.get('/admin/blogs', { params }),
  getBlog: (id) => api.get(`/admin/blogs/${id}`),
  createBlog: (data) => api.post('/admin/blogs', data),
  updateBlog: (id, data) => api.put(`/admin/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),

  uploadBlogImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/admin/blogs/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
