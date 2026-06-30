import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Reaksi Transfusi',
  subtitle: 'Pencatatan insiden reaksi transfusi darah',
  endpoint: '/reaksi-transfusi',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Jumlah Permintaan (Kolf)', key: 'jumlah_permintaan_kolf' },
    { label: 'Darah Masuk (Kolf)', key: 'darah_masuk_kolf' },
    {
      label: 'Ada Reaksi?',
      key: 'ada_reaksi',
      render: (r) => r.ada_reaksi 
        ? '<span class="badge badge-danger">Ya (Reaksi)</span>' 
        : '<span class="badge badge-success">Tidak Ada</span>'
    }
  ],
  rowClass: (r) => r.ada_reaksi ? 'row-danger' : '',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'jumlah_permintaan_kolf', label: 'Jumlah Permintaan (Kolf)', type: 'number', required: true, row: 2 },
    { name: 'darah_masuk_kolf', label: 'Darah Masuk (Kolf)', type: 'number', required: true, row: 2 },
    {
      name: 'ada_reaksi',
      label: 'Ada Reaksi?',
      type: 'select',
      required: true,
      options: [
        { value: 'false', label: 'Tidak Ada Reaksi' },
        { value: 'true', label: 'Ada Reaksi' }
      ],
      row: 3
    },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 3 }
  ]
});
