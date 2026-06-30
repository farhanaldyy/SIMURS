import { createGenericIndicatorPage } from './generic-indicator.js';

const adaBadge = (v) => v === 'ada' 
  ? '<span class="badge badge-success">Ada</span>' 
  : '<span class="badge badge-danger">Tidak Ada</span>';

const adaOptions = [
  { value: 'ada', label: 'Ada' },
  { value: 'tidak ada', label: 'Tidak Ada' }
];

export default createGenericIndicatorPage({
  title: 'Asesmen Awal IGD',
  subtitle: 'Kepatuhan kelengkapan asesmen medis dan keperawatan 24 jam di IGD',
  endpoint: '/asesmen-awal-igd',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Anamnesis', key: 'anamnesis', render: (r) => adaBadge(r.anamnesis) },
    { label: 'TTV', key: 'ttv', render: (r) => adaBadge(r.ttv) },
    { label: 'TB', key: 'tb', render: (r) => adaBadge(r.tb) },
    { label: 'BB', key: 'bb', render: (r) => adaBadge(r.bb) },
    { label: 'Diagnosis', key: 'diagnosis', render: (r) => adaBadge(r.diagnosis) },
    { label: 'Terapi/Rencana', key: 'terapi', render: (r) => adaBadge(r.terapi) }
  ],
  rowClass: (r) => {
    const ok = ['anamnesis', 'ttv', 'tb', 'bb', 'diagnosis', 'terapi'].every(f => r[f] === 'ada');
    return ok ? '' : 'row-danger';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'anamnesis', label: 'Anamnesis', type: 'select', options: adaOptions, required: true, row: 2 },
    { name: 'ttv', label: 'Tanda-tanda Vital (TTV)', type: 'select', options: adaOptions, required: true, row: 2 },
    { name: 'tb', label: 'Tinggi Badan (TB)', type: 'select', options: adaOptions, required: true, row: 3 },
    { name: 'bb', label: 'Berat Badan (BB)', type: 'select', options: adaOptions, required: true, row: 3 },
    { name: 'diagnosis', label: 'Diagnosis Kerja', type: 'select', options: adaOptions, required: true, row: 4 },
    { name: 'terapi', label: 'Rencana Terapi/Tindakan', type: 'select', options: adaOptions, required: true, row: 4 },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 5 }
  ]
});
