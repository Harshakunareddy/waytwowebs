import api from './api';

export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getTaskComments = (id, params) => api.get(`/tasks/${id}/comments`, { params });
export const addTaskComment = (id, data) => api.post(`/tasks/${id}/comments`, data);
export const getTaskActivities = (id, params) => api.get(`/tasks/${id}/activities`, { params });
