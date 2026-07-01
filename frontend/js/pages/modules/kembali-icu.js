import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Kembali ICU',
  subtitle: 'Pencatatan pasien yang kembali ke ICU < 72 jam sejak keluar',
  endpoint: '/kembali-icu',
  ignoreUnit: true,
  metricType: 'count',
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
