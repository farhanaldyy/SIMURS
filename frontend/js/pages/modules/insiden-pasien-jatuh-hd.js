import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Insiden Pasien Jatuh Hemodialisis',
  subtitle: 'Pencatatan kejadian pasien jatuh saat proses hemodialisa',
  endpoint: '/insiden-pasien-jatuh-hd',
  ignoreUnit: true,
  metricType: 'compliance',
  numeratorLabel: 'Total Kejadian (N)',
  denominatorLabel: 'Total Pasien HD (D)',
  metricLabel: 'Persentase',
  hasSummaryData: true,
  summaryDataTitle: 'Parameter Total Pasien HD',
  summaryDataInfo: 'Masukkan total populasi/jumlah seluruh pasien HD pada periode ini sebagai denominator (D) rasio insiden pasien jatuh.',
  summaryDataModalTitle: 'Update Parameter Total Pasien HD',
  summaryDataFields: [
    { name: 'total_pasien', label: 'Total Pasien HD', type: 'number', unit: 'Pasien' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Tgl Kejadian', key: 'tanggal_kejadian', render: (r) => new Date(r.tanggal_kejadian).toLocaleDateString('id-ID') },
    { label: 'Deskripsi Kejadian', key: 'deskripsi_kejadian', render: (r) => r.deskripsi_kejadian ? r.deskripsi_kejadian.replace(/_/g, ' ') : '-' }
  ],
  rowClass: () => 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'tanggal_kejadian', label: 'Tanggal Kejadian', type: 'date', required: true, row: 2 },
    { name: 'deskripsi_kejadian', label: 'Deskripsi Kejadian', type: 'text', required: true, row: 2 }
  ]
});
