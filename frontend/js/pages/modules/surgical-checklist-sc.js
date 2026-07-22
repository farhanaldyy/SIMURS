import { createGenericIndicatorPage } from './generic-indicator.js';

const checkBadge = (v) => v 
  ? '<span class="badge badge-success">Ya</span>' 
  : '<span class="badge badge-danger">Tidak</span>';

export default createGenericIndicatorPage({
  title: 'Surgical Checklist SC',
  subtitle: 'Kepatuhan pelaksanaan Surgical Safety Checklist pada operasi Sectio Caesarea',
  endpoint: '/surgical-checklist-sc',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm', width: '100px' },
    { label: 'DPJP Operator', key: 'dpjp' },
    { label: 'Tanggal', key: 'tanggal', width: '110px', align: 'center', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Sign In', key: 'sign_in', width: '80px', align: 'center', render: (r) => checkBadge(r.sign_in) },
    { label: 'Time Out', key: 'time_out', width: '80px', align: 'center', render: (r) => checkBadge(r.time_out) },
    { label: 'Sign Out', key: 'sign_out', width: '80px', align: 'center', render: (r) => checkBadge(r.sign_out) },
    { label: 'Keterangan', key: 'keterangan', render: (r) => r.keterangan ? r.keterangan : '<span class="text-muted">-</span>' }
  ],
  rowClass: (r) => (r.sign_in && r.time_out && r.sign_out) ? '' : 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'dpjp', label: 'DPJP Operator', type: 'text', required: true, row: 2 },
    { name: 'tanggal', label: 'Tanggal Operasi', type: 'date', required: true, row: 2 },
    { name: 'sign_in', label: 'Sign In Dilakukan?', type: 'boolean', required: true, row: 3 },
    { name: 'time_out', label: 'Time Out Dilakukan?', type: 'boolean', required: true, row: 3 },
    { name: 'sign_out', label: 'Sign Out Dilakukan?', type: 'boolean', required: true, row: 4 },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 4 }
  ]
});
