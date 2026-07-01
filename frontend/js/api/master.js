import { api } from './client.js';

export const getUnits = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/units${query ? '?' + query : ''}`);
};
export const createUnit = (data) => api.post('/units', data);
export const updateUnit = (id, data) => api.put(`/units/${id}`, data);
export const deleteUnit = (id) => api.delete(`/units/${id}`);
export const getPeriode = () => api.get('/periode');
export const createPeriode = (data) => api.post('/periode', data);
export const closePeriode = (id) => api.put(`/periode/${id}/close`);
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
