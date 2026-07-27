import { api } from './client.js';
import Store from '../store.js';

export async function getInformasiRS() {
  return await api.get('/informasi-rs');
}

export async function updateInformasiRS(formDataOrObject) {
  if (formDataOrObject instanceof FormData) {
    const headers = {};
    const token = Store.get('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/informasi-rs', {
        method: 'PUT',
        headers,
        body: formDataOrObject,
        credentials: 'include'
      });
      return await res.json();
    } catch (err) {
      console.error('Update Informasi RS Error:', err);
      return { success: false, message: 'Gagal memperbarui informasi rumah sakit' };
    }
  } else {
    return await api.put('/informasi-rs', formDataOrObject);
  }
}
