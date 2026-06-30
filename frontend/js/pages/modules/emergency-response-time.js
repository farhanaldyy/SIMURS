import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Emergency Response Time',
  subtitle: 'Waktu tanggap pelayanan dokter spesialis/umum di IGD',
  endpoint: '/emergency-response-time',
  metricType: 'average',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Triase', key: 'triase', render: (r) => `<span class="badge triase-${r.triase.toLowerCase()}">${r.triase}</span>` },
    { label: 'Jam Datang', key: 'jam_datang', render: (r) => new Date(r.jam_datang).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Dilayani Dokter', key: 'jam_dilayani_dokter', render: (r) => new Date(r.jam_dilayani_dokter).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Selisih (Menit)', key: 'respon_time_menit', render: (r) => `${r.respon_time_menit} Menit` }
  ],
  rowClass: (r) => parseFloat(r.respon_time_menit) <= 5 ? '' : 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'jam_datang', label: 'Jam Datang (HH:MM)', type: 'time', required: true, row: 2 },
    { name: 'jam_dilayani_dokter', label: 'Jam Dilayani Dokter (HH:MM)', type: 'time', required: true, row: 2 },
    {
      name: 'triase',
      label: 'Triase',
      type: 'select',
      required: true,
      options: [
        { value: 'Merah', label: 'Merah (Resusitasi/Gawat Darurat)' },
        { value: 'Kuning', label: 'Kuning (Mendesak)' },
        { value: 'Hijau', label: 'Hijau (Biasa)' },
        { value: 'Hitam', label: 'Hitam (Meninggal)' }
      ],
      row: 3
    }
  ]
});
