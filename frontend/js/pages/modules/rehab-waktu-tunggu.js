import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Waktu Tunggu Pelayanan Rawat Jalan Rehabilitasi Medik',
  subtitle: 'Pencatatan waktu tunggu pelayanan rawat jalan rehabilitasi medik',
  endpoint: '/rehab-waktu-tunggu',
  metricType: 'average', // Average waiting time metric
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Jml Pasien', key: 'jumlah_pasien' },
    {
      label: 'Distribusi Tunggu',
      render: (r) => {
        return `
          <div style="display: flex; gap: 4px; flex-wrap: nowrap;">
            <span class="badge badge-danger" style="font-size: 0.75rem; padding: 3px 6px;" title="Waktu tunggu > 60 menit">&gt; 60 Menit: ${r.waktu_tunggu_gt_60}</span>
            <span class="badge badge-success" style="font-size: 0.75rem; padding: 3px 6px;" title="Waktu tunggu < 60 menit">&lt; 60 Menit: ${r.waktu_tunggu_lt_60}</span>
          </div>
        `;
      }
    },
    { label: 'Total Waktu', key: 'total_waktu_tunggu', render: (r) => `${r.total_waktu_tunggu} Menit` },
    { label: 'Rerata Tunggu', key: 'rata_rata_waktu_tunggu', render: (r) => `${r.rata_rata_waktu_tunggu} Menit` },
    { label: 'Hasil', key: 'hasil', render: (r) => `${r.hasil}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'jumlah_pasien', label: 'Jumlah Pasien', type: 'number', required: true, row: 1 },
    { name: 'waktu_tunggu_gt_60', label: 'Waktu Tunggu > 60 Menit (Jumlah Pasien)', type: 'number', required: true, row: 2 },
    { name: 'waktu_tunggu_lt_60', label: 'Waktu Tunggu < 60 Menit (Jumlah Pasien)', type: 'number', required: true, row: 2 },
    { name: 'total_waktu_tunggu', label: 'Total Waktu Tunggu (Menit)', type: 'number', required: true, row: 3 }
  ],
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total_pasien || 0}</div>
        <div class="summary-label">Total Pasien</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_waktu_tunggu_lt_60 || 0}</div>
        <div class="summary-label">Total Tunggu < 60 Menit</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.rata_rata_waktu_tunggu || 0} Menit</div>
        <div class="summary-label">Rata-rata Waktu Tunggu</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Hasil (%)</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.rata_rata_waktu_tunggu || 0, s.standar || '≤ 60 menit')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '≤ 60 menit'}</div>
      </div>
    `;
  }
});
