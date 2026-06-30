import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Penundaan Operasi Elektif',
  subtitle: 'Pencatatan penundaan waktu pelaksanaan operasi elektif (> 1 Jam / 60 Menit)',
  endpoint: '/penundaan-operasi',
  ignoreUnit: true,
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'DPJP Bedah', key: 'dpjp' },
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Jadwal Operasi', key: 'jadwal_jam_operasi', render: (r) => new Date(r.jadwal_jam_operasi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Mulai Operasi', key: 'jam_mulai_operasi', render: (r) => r.batal ? '<span class="text-danger" style="font-weight: 500;">Dibatalkan</span>' : new Date(r.jam_mulai_operasi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { 
      label: 'Status Penundaan', 
      render: (r) => {
        if (r.indikasi_medis) return '<span class="badge badge-success">Sesuai (Indikasi Medis)</span>';
        if (r.batal) return '<span class="badge badge-danger">Tertunda (Dibatalkan)</span>';
        if (r.waktu_tunggu_menit > 60) return `<span class="badge badge-danger">Tertunda (${r.waktu_tunggu_menit} Menit)</span>`;
        return `<span class="badge badge-success">Tepat Waktu (${r.waktu_tunggu_menit} Menit)</span>`;
      } 
    }
  ],
  rowClass: (r) => {
    if (r.indikasi_medis) return '';
    if (r.batal || r.waktu_tunggu_menit > 60) return 'row-danger';
    return '';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'dpjp', label: 'DPJP Bedah', type: 'text', required: true, row: 2 },
    { name: 'tanggal', label: 'Tanggal Operasi', type: 'date', required: true, row: 2 },
    { name: 'jadwal_jam_operasi', label: 'Jadwal Jam Operasi (HH:MM)', type: 'time', required: true, row: 3 },
    { name: 'jam_mulai_operasi', label: 'Jam Mulai Operasi Aktual (HH:MM)', type: 'time', required: true, row: 3 },
    { name: 'batal', label: 'Operasi Dibatalkan?', type: 'boolean', required: false, row: 4 },
    { name: 'indikasi_medis', label: 'Ada Indikasi Medis Mendesak?', type: 'boolean', required: false, row: 4 }
  ]
});
