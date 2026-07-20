// SIMURS API Client — fetch() wrapper with auth
import Store from '../store.js';
import { showToast } from '../components/toast.js';

const BASE_URL = '/api';

export async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Store.get('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers, credentials: 'include' };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    if (res.status === 401) {
      // Try refresh
      const refreshed = await tryRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${Store.get('token')}`;
        options.headers = headers;
        const retry = await fetch(`${BASE_URL}${endpoint}`, options);
        return retry.json();
      }
      Store.clear();
      window.location.hash = '#/login';
      return { success: false, message: 'Sesi berakhir. Silakan login kembali.' };
    }

    return res.json();
  } catch (err) {
    console.error('API Error:', err);
    showToast('Gagal terhubung ke server', 'error');
    return { success: false, message: 'Network error' };
  }
}

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success) {
      Store.set('token', data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Shorthand methods
export const api = {
  get: (endpoint) => apiCall('GET', endpoint),
  post: (endpoint, body) => apiCall('POST', endpoint, body),
  put: (endpoint, body) => apiCall('PUT', endpoint, body),
  delete: (endpoint) => apiCall('DELETE', endpoint),
  upload: async (endpoint, formData) => {
    const headers = {};
    const token = Store.get('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });
      return res.json();
    } catch (err) {
      console.error('API Upload Error:', err);
      showToast('Gagal terhubung ke server', 'error');
      return { success: false, message: 'Network error' };
    }
  },
  download: async (endpoint, filename) => {
    const headers = {};
    const token = Store.get('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Error:', err);
      showToast('Gagal mengunduh file', 'error');
    }
  }
};
