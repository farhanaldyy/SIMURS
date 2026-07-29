import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Kembali ICU',
  subtitle: 'Pencatatan pasien yang kembali ke ICU < 72 jam sejak keluar',
  endpoint: '/kembali-icu',
  ignoreUnit: true,
  metricType: 'compliance',
  numeratorLabel: 'Total Kejadian (N)',
  denominatorLabel: 'Total Pasien ICU (D)',
  metricLabel: 'Persentase',
  hasSummaryData: true,
  summaryDataTitle: 'Parameter Total Pasien ICU',
  summaryDataInfo: 'Masukkan total populasi/jumlah seluruh pasien ICU pada periode ini sebagai denominator (D) rasio pasien kembali ke ICU.',
  summaryDataModalTitle: 'Update Parameter Total Pasien ICU',
  summaryDataFields: [
    { name: 'total_pasien', label: 'Total Pasien ICU', type: 'number', unit: 'Pasien' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Diagnosis', key: 'diagnosis' },
    { label: 'DPJP', key: 'dpjp' },
    { label: 'Keterangan/Alasan', key: 'keterangan' }
  ],
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'diagnosis', label: 'Diagnosis', type: 'text', required: true, row: 2 },
    { name: 'dpjp', label: 'DPJP', type: 'text', required: true, row: 2 },
    { name: 'keterangan', label: 'Alasan Kembali ke ICU', type: 'text', required: true, row: 3 }
  ]
});

