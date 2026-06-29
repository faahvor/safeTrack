import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token from localStorage if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('st_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('st_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put('/profile', data),
};

// ─── Contacts ────────────────────────────────────────────────────────────────
export const contactsApi = {
  list: () => api.get('/contacts'),
  create: (data: object) => api.post('/contacts', data),
  update: (id: string, data: object) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

// ─── Journeys ────────────────────────────────────────────────────────────────
export const journeysApi = {
  create: (data: object) => api.post('/journeys', data),
  list: () => api.get('/journeys'),
  get: (id: string) => api.get(`/journeys/${id}`),
  update: (id: string, data: object) => api.put(`/journeys/${id}`, data),
  end: (id: string) => api.patch(`/journeys/${id}/end`),
};

// ─── Location ────────────────────────────────────────────────────────────────
export const locationApi = {
  update: (data: { journeyId: string; latitude: number; longitude: number }) =>
    api.post('/location/update', data),
  latest: () => api.get('/location/latest'),
  history: (journeyId: string) => api.get(`/location/history/${journeyId}`),
};

// ─── SOS ─────────────────────────────────────────────────────────────────────
export const sosApi = {
  trigger: (data: { latitude: number; longitude: number; address?: string }) =>
    api.post('/sos', data),
  history: () => api.get('/sos/history'),
  resolve: (id: string) => api.patch(`/sos/${id}/resolve`),
};

// ─── Medical ─────────────────────────────────────────────────────────────────
export const medicalApi = {
  get: () => api.get('/profile/medical'),
  update: (data: object) => api.put('/profile/medical', data),
};

// ─── SOS Privacy ─────────────────────────────────────────────────────────────
export const sosPrivacyApi = {
  get: () => api.get('/profile/sos-privacy'),
  update: (data: object) => api.put('/profile/sos-privacy', data),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Check-ins ────────────────────────────────────────────────────────────────
export const checkInsApi = {
  list: () => api.get('/checkins'),
  create: (data?: { journeyId?: string; message?: string }) => api.post('/checkins', data ?? {}),
};
