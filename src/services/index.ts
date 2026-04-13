import api from '../lib/axios';

// Auth
export const authService = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Users
export const usersService = {
  getAll: (params?: any) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

// Books
export const booksService = {
  getAll: (params?: any) => api.get('/books', { params }),
  getOne: (id: string) => api.get(`/books/${id}`),
  create: (data: FormData) => api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.patch(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/books/${id}`),
  getStats: () => api.get('/books/stats'),
};

// Categories
export const categoriesService = {
  getAll: () => api.get('/categories'),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Borrow
export const borrowService = {
  issue: (data: { bookId: string; userId: string; dueDate?: string }) => api.post('/borrow/issue', data),
  return: (borrowRecordId: string) => api.post('/borrow/return', { borrowRecordId }),
  renew: (borrowRecordId: string, newDueDate?: string) => api.post('/borrow/renew', { borrowRecordId, newDueDate }),
  getHistory: (params?: any) => api.get('/borrow/history', { params }),
  getOverdue: () => api.get('/borrow/overdue'),
  getStats: () => api.get('/borrow/stats'),
};

// Fines
export const finesService = {
  getAll: (params?: any) => api.get('/fines', { params }),
  getMyFines: () => api.get('/fines/my-fines'),
  pay: (id: string) => api.post(`/fines/${id}/pay`),
  waive: (id: string) => api.patch(`/fines/${id}/waive`),
  getStats: () => api.get('/fines/stats'),
};

// Notifications
export const notificationsService = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
