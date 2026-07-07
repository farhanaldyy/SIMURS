import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Sisa Makanan Yang Tidak Termakan Oleh Pasien',
  subtitle: 'Pencatatan sisa makanan yang tidak termakan oleh pasien rawat inap',
  endpoint: '/gizi-sisa-makanan',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Jumlah Sisa Makanan', key: 'jumlah_sisa' },
    { label: 'Jumlah Porsi', key: 'jumlah_porsi' },
    { label: 'Persentase Sisa', key: 'persentase', render: (r) => `${r.persentase}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'jumlah_sisa', label: 'Jumlah Sisa Makanan Yang Tidak Termakan', type: 'number', required: true, row: 2 },
    { name: 'jumlah_porsi', label: 'Jumlah Porsi Sehari', type: 'number', required: true, row: 2 }
  ],
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Hari</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_numerator || 0}</div>
        <div class="summary-label">Total Sisa (Rata-rata: ${s.avg_numerator || 0}/hari)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_denominator || 0}</div>
        <div class="summary-label">Total Porsi (Rata-rata: ${s.avg_denominator || 0}/hari)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Persentase Sisa</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, s.standar || '≤ 20%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '≤ 20%'}</div>
      </div>
    `;
  }
});
