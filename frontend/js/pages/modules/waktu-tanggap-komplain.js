import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Kecepatan Waktu Tanggap Komplain',
  subtitle: 'Pencatatan kecepatan waktu tanggap komplain pasien/pengunjung. Standar: ≥ 80%',
  endpoint: '/waktu-tanggap-komplain',
  metricType: 'compliance',
  metricLabel: 'Komplain Sesuai Standar Waktu',
  numeratorLabel: 'Komplain Sesuai Standar (N)',
  denominatorLabel: 'Total Komplain (D)',
  infoCardHTML: `
    <div style="background: rgba(13, 202, 240, 0.1); border-left: 4px solid var(--color-info, #0dcaf0); padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; color: var(--color-text);">
      <strong>ℹ️ Standar Waktu Tanggap Berdasarkan Grading Risiko:</strong><br>
      • <strong>Merah (Ekstrim)</strong>: Maksimal 1 x 24 jam sejak keluhan disampaikan.<br>
      • <strong>Kuning (Tinggi)</strong>: Maksimal 3 hari.<br>
      • <strong>Hijau (Rendah)</strong>: Maksimal 7 hari.<br>
      Status kepatuhan (Sesuai/Tidak Sesuai Standar) dihitung otomatis dari kategori dan lama tanggap input.
    </div>
  `,
  columns: [
    { label: 'Tanggal Input', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm', render: (r) => r.no_rm || '-' },
    { label: 'Kategori Komplain', key: 'kategori_komplain' },
    { label: 'Lama Tanggap (Jam)', key: 'lama_tanggap_jam', render: (r) => `${r.lama_tanggap_jam || 0} jam` },
    {
      label: 'Status', render: (r) => r.status_tanggap === 'Sesuai Standar'
        ? '<span class="badge badge-success">Sesuai Standar</span>'
        : '<span class="badge badge-danger">Tidak Sesuai Standar</span>'
    },
    { label: 'Keterangan Komplain', key: 'keterangan', render: (r) => r.keterangan || '-' }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'nama_pasien', label: 'Nama Pasien / Pelapor', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: false, row: 2 },
    { name: 'kategori_komplain', label: 'Kategori Komplain', type: 'select', options: [{ value: 'Merah', label: 'Merah (Ekstrim, Maks 24 Jam)' }, { value: 'Kuning', label: 'Kuning (Tinggi, Maks 3 Hari)' }, { value: 'Hijau', label: 'Hijau (Rendah, Maks 7 Hari)' }], required: true, row: 2 },
    { name: 'lama_tanggap_jam', label: 'Lama Tanggap (Jam)', type: 'number', required: true, row: 3 },
    { name: 'keterangan', label: 'Keterangan Komplain', type: 'text', required: false, row: 4, placeholder: 'Contoh: Komplain ditangani dan selesai dalam 2 jam' }
  ],
  beforeSubmit(formData) {
    if (!formData.tanggal) {
      formData.tanggal = new Date().toISOString().split('T')[0];
    }
    if (formData.lama_tanggap_jam !== undefined) {
      formData.lama_tanggap_jam = parseFloat(formData.lama_tanggap_jam);
    }
  }
});
