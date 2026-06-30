import { api } from './client.js';

export function login(username, password) {
  return api.post('/auth/login', { username, password });
}

export function logout() {
  return api.post('/auth/logout');
}

export function refreshToken() {
  return api.post('/auth/refresh-token');
}

export function getMe() {
  return api.get('/auth/me');
}
