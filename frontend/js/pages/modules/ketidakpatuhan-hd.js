import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Ketidakpatuhan Pasien HD',
  subtitle: 'Pencatatan ketidakpatuhan jadwal terapi pasien Hemodialisa',
  endpoint: '/ketidakpatuhan-hd',
  ignoreUnit: true,
  metricType: 'compliance',
  hasSummaryData: true,
  summaryDataFields: [
    { name: 'total_pasien_hd', label: 'Total Pasien HD Bulan Ini', type: 'number' },
    { name: 'total_avgraft_avf', label: 'Jumlah Pasien dengan Avgraft/AVF', type: 'number' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Jadwal HD / Minggu', key: 'jadwal_hd_per_minggu' },
    { label: 'Hari Tidak Datang', key: 'hari_tidak_datang' },
    { label: 'Alasan', key: 'alasan' }
  ],
  rowClass: () => 'row-danger', // All records represent a missed session (non-compliance event)
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'jadwal_hd_per_minggu', label: 'Frekuensi Jadwal HD / Minggu (misal: 2x)', type: 'text', required: true, row: 2 },
    { name: 'hari_tidak_datang', label: 'Hari Absen (misal: Senin)', type: 'text', required: true, row: 2 },
    { name: 'alasan', label: 'Alasan Tidak Datang', type: 'text', required: true, row: 3 }
  ]
});
