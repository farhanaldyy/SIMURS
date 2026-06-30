import { api } from '../client.js';
const BASE = '/insiden-keselamatan';
export const getAll = (params) => api.get(`${BASE}?${new URLSearchParams(params)}`);
export const create = (data) => api.post(BASE, data);
export const update = (id, data) => api.put(`${BASE}/${id}`, data);
export const remove = (id) => api.delete(`${BASE}/${id}`);
export const getSummary = (params) => api.get(`${BASE}/summary?${new URLSearchParams(params)}`);
