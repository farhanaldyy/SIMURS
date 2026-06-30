import { api } from './client.js';

export const getUnits = () => api.get('/units');
export const getPeriode = () => api.get('/periode');
export const createPeriode = (data) => api.post('/periode', data);
export const closePeriode = (id) => api.put(`/periode/${id}/close`);
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
