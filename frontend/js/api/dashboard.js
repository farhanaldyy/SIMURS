import { api } from './client.js';
export const getSummary = (params) => api.get(`/dashboard/summary?${new URLSearchParams(params)}`);
