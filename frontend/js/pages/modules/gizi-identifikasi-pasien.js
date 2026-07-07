import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Kepatuhan Identifikasi Pasien (Permintaan SIMRS)',
  subtitle: 'Pencatatan kepatuhan identifikasi pasien rawat inap pada saat pemberian makanan',
  endpoint: '/gizi-identifikasi-pasien',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Jumlah Penulisan Sesuai', key: 'jumlah_sesuai' },
    { label: 'Jumlah Pasien Ranap', key: 'jumlah_pasien_ranap' },
    { label: 'Persentase Kepatuhan', key: 'persentase', render: (r) => `${r.persentase}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'jumlah_sesuai', label: 'Jumlah Penulisan Identitas/Label Sesuai', type: 'number', required: true, row: 2 },
    { name: 'jumlah_pasien_ranap', label: 'Jumlah Pasien Rawat Inap', type: 'number', required: true, row: 2 }
  ],
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Hari</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_numerator || 0}</div>
        <div class="summary-label">Total Sesuai (Rata-rata: ${s.avg_numerator || 0}/hari)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_denominator || 0}</div>
        <div class="summary-label">Total Pasien Ranap (Rata-rata: ${s.avg_denominator || 0}/hari)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Persentase Kepatuhan</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, s.standar || '100%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '100%'}</div>
      </div>
    `;
  }
});
