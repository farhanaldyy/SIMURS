import { createGenericIndicatorPage } from './generic-indicator.js';

export default createGenericIndicatorPage({
  title: 'Kepuasan Pasien Pada Pelayanan',
  subtitle: 'Pencatatan survei tingkat kepuasan pasien pada pelayanan rumah sakit (1x input per periode/bulan)',
  endpoint: '/kepuasan-pasien-pelayanan',
  metricType: 'compliance',
  metricLabel: 'Rata-Rata Penilaian',
  numeratorLabel: 'Rata-Rata Penilaian Pasien',
  denominatorLabel: 'Total Pasien',
  infoCardHTML: `
    <div style="background: rgba(13, 202, 240, 0.1); border-left: 4px solid var(--color-info, #0dcaf0); padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; color: var(--color-text);">
      <strong>ℹ️ Catatan Pengisian:</strong> Data indikator kepuasan pasien diinput <strong>1 (satu) kali per periode / bulan</strong>. Standar Minimal Mutu: <strong>≥ 76,61%</strong>.
    </div>
  `,
  columns: [
    { label: 'Tanggal Input', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Total Pasien', field: 'total_pasien', render: (r) => r.total_pasien || 0 },
    { label: 'Rata-Rata Penilaian Pasien', field: 'rata_rata_penilaian', render: (r) => `${r.rata_rata_penilaian || 0}%` },
    { label: 'Capaian Kepuasan', field: 'persentase', render: (r) => `<strong style="color: ${(r.persentase || 0) >= 76.61 ? 'var(--color-success, #198754)' : 'var(--color-danger, #dc3545)'};">${r.persentase || 0}%</strong>` },
    { label: 'Keterangan', field: 'keterangan', render: (r) => r.keterangan || '-' }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal Input', type: 'date', required: true },
    { name: 'total_pasien', label: 'Total Pasien (Responden)', type: 'number', required: true, placeholder: 'Contoh: 100' },
    { name: 'rata_rata_penilaian', label: 'Rata Rata Penilaian Pasien (%)', type: 'number', required: true, placeholder: 'Contoh: 85.5' },
    { name: 'keterangan', label: 'Keterangan', type: 'text', required: false, placeholder: 'Catatan tambahan (opsional)' }
  ],
  beforeSubmit(formData) {
    if (!formData.tanggal) {
      formData.tanggal = new Date().toISOString().split('T')[0];
    }
  }
});
