import { createGenericIndicatorPage } from './generic-indicator.js';

const jadwalHdOptions = [
  { value: '', label: '-- Pilih Jadwal HD --' },
  { value: '1x / Minggu', label: '1x / Minggu' },
  { value: '2x / Minggu', label: '2x / Minggu' },
  { value: '3x / Minggu', label: '3x / Minggu' },
  { value: '4x / Minggu', label: '4x / Minggu' },
  { value: '5x / Minggu', label: '5x / Minggu' },
  { value: '6x / Minggu', label: '6x / Minggu' },
  { value: '7x / Minggu', label: '7x / Minggu' }
];

const hariOptions = [
  { value: '', label: '-- Pilih Hari Absen --' },
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
  { value: 'Minggu', label: 'Minggu' }
];

export default createGenericIndicatorPage({
  title: 'Ketidakpatuhan Pasien HD',
  subtitle: 'Pencatatan ketidakpatuhan jadwal terapi pasien Hemodialisa',
  endpoint: '/ketidakpatuhan-hd',
  ignoreUnit: true,
  metricType: 'compliance',
  numeratorLabel: 'Pasien Tidak Patuh (N)',
  denominatorLabel: 'Total Pasien HD (D)',
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
    { name: 'jadwal_hd_per_minggu', label: 'Frekuensi Jadwal HD / Minggu', type: 'select', options: jadwalHdOptions, required: true, row: 2 },
    { name: 'hari_tidak_datang', label: 'Hari Absen / Tidak Datang', type: 'select', options: hariOptions, required: true, row: 2 },
    { name: 'alasan', label: 'Alasan Tidak Datang', type: 'text', required: true, row: 3 }
  ]
});
