import { createGenericIndicatorPage } from './generic-indicator.js';

const ses = (v) => v === 'Sesuai'
  ? '<span class="badge badge-success">Sesuai</span>'
  : '<span class="badge badge-danger">Tidak</span>';

const sesOptions = [
  { value: 'Sesuai', label: 'Sesuai' },
  { value: 'Tidak Sesuai', label: 'Tidak Sesuai' }
];

export default createGenericIndicatorPage({
  title: 'Serah Terima Pasien',
  subtitle: 'Kepatuhan prosedur serah terima pasien antar ruangan',
  endpoint: '/serah-terima-pasien',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'SBAR', key: 'akun', render: (r) => ses(r.akun) },
    { label: 'Keluhan', key: 'keluhan', render: (r) => ses(r.keluhan) },
    { label: 'TTV', key: 'ttv', render: (r) => ses(r.ttv) },
    { label: 'Penunjang', key: 'penunjang', render: (r) => ses(r.penunjang) },
    { label: 'Konsul', key: 'konsul', render: (r) => ses(r.konsul) },
    { label: 'Tindakan', key: 'tindakan', render: (r) => ses(r.tindakan) },
    { label: 'Obat', key: 'obat', render: (r) => ses(r.obat) }
  ],
  rowClass: (r) => {
    const ok = ['akun', 'keluhan', 'ttv', 'penunjang', 'konsul', 'tindakan', 'obat'].every(f => r[f] === 'Sesuai');
    return ok ? '' : 'row-danger';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'akun', label: 'Identifikasi Akun (SBAR)', type: 'select', options: sesOptions, required: true, row: 2 },
    { name: 'keluhan', label: 'Keluhan Pasien', type: 'select', options: sesOptions, required: true, row: 2 },
    { name: 'ttv', label: 'Tanda-tanda Vital (TTV)', type: 'select', options: sesOptions, required: true, row: 3 },
    { name: 'penunjang', label: 'Hasil Penunjang/Lab', type: 'select', options: sesOptions, required: true, row: 3 },
    { name: 'konsul', label: 'Konsul DPJP', type: 'select', options: sesOptions, required: true, row: 4 },
    { name: 'tindakan', label: 'Tindakan Terapi', type: 'select', options: sesOptions, required: true, row: 4 },
    { name: 'obat', label: 'Obat-obatan', type: 'select', options: sesOptions, required: true, row: 5 },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 5 }
  ]
});
