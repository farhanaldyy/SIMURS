import { createGenericIndicatorPage } from './generic-indicator.js';

const valBadge = (v) => v 
  ? '<span class="badge badge-success">Ya/Dilakukan</span>' 
  : '<span class="badge badge-danger">Tidak</span>';

export default createGenericIndicatorPage({
  title: 'Penandaan Lokasi Operasi',
  subtitle: 'Kepatuhan prosedur penandaan lokasi tindakan operasi (Site Marking)',
  endpoint: '/penandaan-lokasi-operasi',
  ignoreUnit: true,
  metricType: 'compliance',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Penandaan Dilakukan?', key: 'dilakukan', render: (r) => valBadge(r.dilakukan) },
    {
      label: 'Tidak Berlaku (N/A)?',
      key: 'not_applicable',
      render: (r) => r.not_applicable 
        ? '<span class="badge badge-warning">N/A (Misal: Organ Tunggal)</span>' 
        : '<span class="badge badge-outline">Berlaku</span>'
    }
  ],
  rowClass: (r) => {
    if (r.not_applicable) return '';
    return r.dilakukan ? '' : 'row-danger';
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'dilakukan', label: 'Apakah Lokasi Operasi Ditandai?', type: 'boolean', required: true, row: 2 },
    { name: 'not_applicable', label: 'Tidak Berlaku (N/A) / Organ Tunggal?', type: 'boolean', required: true, row: 2 },
    { name: 'keterangan', label: 'Keterangan/Lokasi Operasi', type: 'text', required: false, row: 3 }
  ]
});
