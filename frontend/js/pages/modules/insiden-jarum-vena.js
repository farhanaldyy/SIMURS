import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Insiden Jarum Vena Fistula',
  subtitle: 'Pencatatan insiden kegagalan/komplikasi pemasangan jarum vena fistula',
  endpoint: '/insiden-jarum-vena',
  ignoreUnit: true,
  metricType: 'compliance',
  hasSummaryData: true,
  summaryDataFields: [
    { name: 'total_pemasangan_bulan', label: 'Total Pemasangan Bulan Ini', type: 'number' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Tgl Kejadian', key: 'tanggal_kejadian', render: (r) => new Date(r.tanggal_kejadian).toLocaleDateString('id-ID') },
    { label: 'Perawat Pemasang', key: 'perawat_pemasang' },
    { label: 'Penyebab Komplikasi', key: 'penyebab' }
  ],
  rowClass: () => 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'tanggal_kejadian', label: 'Tanggal Kejadian', type: 'date', required: true, row: 2 },
    { name: 'perawat_pemasang', label: 'Perawat Pemasang', type: 'text', required: true, row: 2 },
    { name: 'penyebab', label: 'Penyebab Kegagalan/Komplikasi (misal: Hematoma)', type: 'text', required: true, row: 3 }
  ]
});
