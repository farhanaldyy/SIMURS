import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Insiden Clotting Durante HD',
  subtitle: 'Pencatatan kejadian pembekuan darah (clotting) saat proses hemodialisa',
  endpoint: '/insiden-clotting',
  ignoreUnit: true,
  metricType: 'compliance',
  numeratorLabel: 'Total Kejadian (N)',
  denominatorLabel: 'Total Pasien HD (D)',
  metricLabel: 'Persentase',
  hasSummaryData: true,
  summaryDataTitle: 'Parameter Total Pasien HD',
  summaryDataInfo: 'Masukkan total populasi/jumlah seluruh pasien HD pada periode ini sebagai denominator (D) rasio insiden clotting.',
  summaryDataModalTitle: 'Update Parameter Total Pasien HD',
  summaryDataFields: [
    { name: 'total_pasien', label: 'Total Pasien HD', type: 'number', unit: 'Pasien' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Tgl Kejadian', key: 'tanggal_kejadian', render: (r) => new Date(r.tanggal_kejadian).toLocaleDateString('id-ID') },
    { label: 'Deskripsi Insiden', key: 'deskripsi_insiden' },
    { label: 'Pemberian Antiplatelet', key: 'pemberian_antiplatelet' }
  ],
  rowClass: () => 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'tanggal_kejadian', label: 'Tanggal Kejadian', type: 'date', required: true, row: 2 },
    { name: 'pemberian_antiplatelet', label: 'Antiplatelet Yang Diberikan (misal: Heparin)', type: 'text', required: true, row: 2 },
    { name: 'deskripsi_insiden', label: 'Deskripsi Detil Insiden', type: 'text', required: true, row: 3 }
  ]
});
