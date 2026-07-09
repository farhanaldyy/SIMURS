import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

export default createGenericIndicatorPage({
  title: 'Kepuasan Pasien dengan Pelayanan Rehabilitasi Medik',
  subtitle: 'Pencatatan kepuasan pasien (sampling kuisioner) pelayanan rehabilitasi medik',
  endpoint: '/rehab-kepuasan-pasien',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Pasien (Sampling)', key: 'nama_pasien' },
    { label: 'Nilai Maksimal Kuisioner', key: 'nilai_maksimal' },
    { label: 'Hasil Kuisioner', key: 'hasil_kuisioner' },
    { label: 'Total', key: 'total', render: (r) => `${r.total}%` }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'nama_pasien', label: 'Pasien (Sampling) / Kode Anonim', type: 'text', required: true, row: 1 },
    { name: 'nilai_maksimal', label: 'Nilai Maksimal Kuisioner', type: 'number', required: true, row: 2 },
    { name: 'hasil_kuisioner', label: 'Hasil Kuisioner', type: 'number', required: true, row: 2 }
  ],
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Sampel Pasien</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_nilai_maksimal || 0}</div>
        <div class="summary-label">Total Nilai Maksimal</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.total_hasil_kuisioner || 0}</div>
        <div class="summary-label">Total Hasil Kuisioner</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Rata-rata Kepuasan</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, s.standar || '≥ 75%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '≥ 75%'}</div>
      </div>
    `;
  }
});
