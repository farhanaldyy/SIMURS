import { api } from './client.js';
import Store from '../store.js';

export async function getSettings() {
  return await api.get('/settings');
}

export async function updateSettings(formDataOrObject) {
  if (formDataOrObject instanceof FormData) {
    const headers = {};
    const token = Store.get('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers,
      body: formDataOrObject,
      credentials: 'include',
    });
    return await res.json();
  }
  return await api.put('/settings', formDataOrObject);
}

export async function getInmMappings() {
  return await api.get('/settings/inm-mappings');
}

export async function updateInmMapping(id, body) {
  return await api.put(`/settings/inm-mappings/${id}`, body);
}

export async function getIntegrationLogs() {
  return await api.get('/settings/integration-logs');
}

export async function simulateDryRunSync(target_system = 'SIMAR') {
  return await api.post('/settings/simulate-sync', { target_system });
}

export async function exportSimarExcel(bulan, tahun) {
  const filename = `Laporan_SIMAR_INM_${bulan}_${tahun}.xlsx`;
  return await api.download(`/simar/export-excel?bulan=${bulan}&tahun=${tahun}`, filename);
}
