import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Angka Kematian IGD',
  subtitle: 'Pencatatan kasus kematian pasien < 8 jam di IGD',
  endpoint: '/angka-kematian-igd',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Tgl Masuk', key: 'tanggal_masuk', render: (r) => new Date(r.tanggal_masuk).toLocaleDateString('id-ID') },
    { label: 'Jam Masuk', key: 'jam_masuk', render: (r) => new Date(r.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Tgl Wafat', key: 'tanggal_keluar', render: (r) => new Date(r.tanggal_keluar).toLocaleDateString('id-ID') },
    { label: 'Jam Wafat', key: 'jam_keluar', render: (r) => new Date(r.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Keterangan', key: 'keterangan' }
  ],
  rowClass: (r) => {
    // Flag if death is under 8 hours (non-compliant)
    const m = new Date(r.tanggal_masuk);
    const jm = new Date(r.jam_masuk);
    m.setHours(jm.getHours(), jm.getMinutes(), 0, 0);

    const k = new Date(r.tanggal_keluar);
    const jk = new Date(r.jam_keluar);
    k.setHours(jk.getHours(), jk.getMinutes(), 0, 0);

    const diffHours = (k - m) / 3600000;
    return diffHours < 8 ? 'row-danger' : '';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'tanggal_masuk', label: 'Tanggal Masuk', type: 'date', required: true, row: 2 },
    { name: 'jam_masuk', label: 'Jam Masuk (HH:MM)', type: 'time', required: true, row: 2 },
    { name: 'tanggal_keluar', label: 'Tanggal Keluar/Wafat', type: 'date', required: true, row: 3 },
    { name: 'jam_keluar', label: 'Jam Keluar/Wafat (HH:MM)', type: 'time', required: true, row: 3 },
    { name: 'keterangan', label: 'Penyebab/Keterangan', type: 'text', required: false, row: 4 }
  ]
});
