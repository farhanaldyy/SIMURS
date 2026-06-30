import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Double Check High Alert',
  subtitle: 'Kepatuhan verifikasi ganda pemberian obat kewaspadaan tinggi (High Alert)',
  endpoint: '/double-check-high-alert',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Diagnosis', key: 'diagnosis' },
    { label: 'Nama Obat', key: 'nama_obat' },
    { label: 'Penyerah', key: 'nama_penyerah' },
    { label: 'Penerima/Verifikator', key: 'nama_penerima' }
  ],
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'diagnosis', label: 'Diagnosis', type: 'text', required: true, row: 2 },
    { name: 'nama_obat', label: 'Nama Obat High Alert', type: 'text', required: true, row: 2 },
    { name: 'nama_penyerah', label: 'Nama Perawat Penyerah', type: 'text', required: true, row: 3 },
    { name: 'nama_penerima', label: 'Nama Perawat Penerima/Verifikator', type: 'text', required: true, row: 3 },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 4 }
  ]
});
