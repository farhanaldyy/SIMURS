import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Kepatuhan Identitas Pasien Rehabilitasi Medik',
  subtitle: 'Pencatatan kepatuhan identifikasi pasien rehabilitasi medik',
  endpoint: '/rehab-kepatuhan-identitas',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Jumlah Ketidakpatuhan Pasien', key: 'jumlah_ketidakpatuhan' },
    { label: 'Hasil', key: 'hasil', render: (r) => `${r.hasil}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'jumlah_pasien', label: 'Jumlah Pasien', type: 'number', required: true, row: 2 },
    { name: 'jumlah_ketidakpatuhan', label: 'Jumlah Ketidakpatuhan Pasien', type: 'number', required: true, row: 2 }
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
        <div class="summary-value">${s.total_ketidakpatuhan || 0}</div>
        <div class="summary-label">Total Ketidakpatuhan</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Hasil</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, s.standar || '100%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '100%'}</div>
      </div>
    `;
  }
});
