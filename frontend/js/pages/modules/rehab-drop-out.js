import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Kejadian Drop Out Pasien Terhadap Pelayanan Rehabilitasi Medik',
  subtitle: 'Pencatatan kejadian drop out pasien terhadap pelayanan rehabilitasi medik yang direncanakan',
  endpoint: '/rehab-drop-out',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Jumlah Drop Out', key: 'jumlah_drop_out' },
    { label: 'Hasil', key: 'hasil', render: (r) => `${r.hasil}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'jumlah_pasien', label: 'Jumlah Pasien', type: 'number', required: true, row: 2 },
    { name: 'jumlah_drop_out', label: 'Jumlah Drop Out Pasien', type: 'number', required: true, row: 2 }
  ],
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Hari</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_pasien || 0}</div>
        <div class="summary-label">Total Pasien</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_drop_out || 0}</div>
        <div class="summary-label">Total Drop Out</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Hasil</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, s.standar || '≤ 50%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '≤ 50%'}</div>
      </div>
    `;
  }
});
