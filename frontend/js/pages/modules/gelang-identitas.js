import { createGenericIndicatorPage } from './generic-indicator.js';

const dil = (v) => v === 'dilakukan'
  ? '<span class="badge badge-success">Dilakukan</span>'
  : '<span class="badge badge-danger">Tidak</span>';

const dlkOptions = [
  { value: 'dilakukan', label: 'Dilakukan' },
  { value: 'tidak dilakukan', label: 'Tidak Dilakukan' }
];

export default createGenericIndicatorPage({
  title: 'Gelang Identitas',
  subtitle: 'Pencatatan kepatuhan pemasangan gelang identitas pasien',
  endpoint: '/gelang-identitas',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Gelang Identitas', key: 'gelang_identitas', render: (r) => dil(r.gelang_identitas) },
    { label: 'Penanda Alergi', key: 'alergi', render: (r) => dil(r.alergi) },
    { label: 'Penanda Risiko Jatuh', key: 'fall_risk', render: (r) => dil(r.fall_risk) },
    { label: 'Penanda DNR', key: 'dnr', render: (r) => dil(r.dnr) }
  ],
  rowClass: (r) => {
    const ok = ['gelang_identitas', 'alergi', 'fall_risk', 'dnr'].every(f => r[f] === 'dilakukan');
    return ok ? '' : 'row-danger';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'gelang_identitas', label: 'Gelang Identitas', type: 'select', options: dlkOptions, required: true, row: 2 },
    { name: 'alergi', label: 'Penanda Alergi', type: 'select', options: dlkOptions, required: true, row: 2 },
    { name: 'fall_risk', label: 'Penanda Risiko Jatuh', type: 'select', options: dlkOptions, required: true, row: 3 },
    { name: 'dnr', label: 'Penanda DNR', type: 'select', options: dlkOptions, required: true, row: 3 },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 4 }
  ]
});
