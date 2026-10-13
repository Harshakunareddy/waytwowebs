import api from './api';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const refreshToken = (data) => api.post('/auth/refresh', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
