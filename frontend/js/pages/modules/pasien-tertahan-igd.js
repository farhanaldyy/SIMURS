import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Pasien Tertahan IGD',
  subtitle: 'Waktu tunggu pasien di IGD sebelum dipindahkan ke ruangan (> 6 jam atau 240 menit)',
  endpoint: '/pasien-tertahan-igd',
  metricType: 'average',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Jam Masuk', key: 'jam_masuk', render: (r) => new Date(r.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Pindah Ruangan', key: 'jam_pindah_ruangan', render: (r) => new Date(r.jam_pindah_ruangan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Waktu Tunggu', key: 'waktu_tunggu_menit', render: (r) => `${r.waktu_tunggu_menit} Menit` },
    { label: 'Keterangan', key: 'keterangan' }
  ],
  rowClass: (r) => r.waktu_tunggu_menit <= 240 ? '' : 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'jam_masuk', label: 'Jam Masuk (HH:MM)', type: 'time', required: true, row: 2 },
    { name: 'jam_pindah_ruangan', label: 'Jam Pindah Ruangan (HH:MM)', type: 'time', required: true, row: 2 },
    { name: 'keterangan', label: 'Alasan Tertahan/Keterangan', type: 'text', required: false, row: 3 }
  ]
});
