import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Asesmen Pra Bedah',
  subtitle: 'Kepatuhan kelengkapan pengisian asesmen pra bedah sebelum tindakan operasi',
  endpoint: '/asesmen-pra-bedah',
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'DPJP Bedah', key: 'dpjp' },
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    {
      label: 'Lengkap Diisi?',
      key: 'diisi',
      render: (r) => r.diisi 
        ? '<span class="badge badge-success">Lengkap</span>' 
        : '<span class="badge badge-danger">Tidak Lengkap</span>'
    }
  ],
  rowClass: (r) => r.diisi ? '' : 'row-danger',
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'dpjp', label: 'DPJP Bedah', type: 'text', required: true, row: 2 },
    { name: 'tanggal', label: 'Tanggal Asesmen', type: 'date', required: true, row: 2 },
    {
      name: 'diisi',
      label: 'Lengkap Diisi?',
      type: 'select',
      required: true,
      options: [
        { value: 'true', label: 'Lengkap Diisi' },
        { value: 'false', label: 'Tidak Lengkap / Belum Diisi' }
      ],
      row: 3
    },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, row: 3 },
    {
      name: 'also_save_pra_anestesi',
      label: 'Simpan juga ke Asesmen Pra Anestesi?',
      type: 'boolean',
      required: false,
      hideOnEdit: true,
      row: 4
    }
  ]
});
