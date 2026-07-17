import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Pelaporan Hasil Kritis Lab ≤ 30 Menit',
  subtitle: 'Pelaporan hasil kritis laboratorium ≤ 30 menit',
  endpoint: '/laboratorium-hasil-kritis',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Nilai Kritis', key: 'nilai_kritis' },
    { label: '< 30 Menit', key: 'lt_30' },
    { label: '> 30 Menit', key: 'gt_30' },
    { 
      label: 'Persentase', 
      render: (r) => `${r.presentase || 0}%`
    }
  ],
  fields: [
    {
      name: 'tanggal',
      label: 'Tanggal',
      type: 'date',
      required: true,
      row: 1
    },
    {
      name: 'nilai_kritis',
      label: 'Nilai Kritis',
      type: 'number',
      required: true,
      row: 1
    },
    {
      name: 'lt_30',
      label: '< 30 Menit',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'gt_30',
      label: '> 30 Menit',
      type: 'number',
      required: true,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalNilaiKritis = s.total_nilai_kritis || 0;
    const totalLt30 = s.total_lt_30 || 0;
    const totalGt30 = s.total_gt_30 || 0;
    const presentase = s.presentase || 0;
    const standar = s.standar || '100%';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalNilaiKritis}</div><div class="summary-label">Total Nilai Kritis</div></div>
        <div class="summary-item"><div class="summary-value">${totalLt30}</div><div class="summary-label">Total < 30 Menit</div></div>
        <div class="summary-item"><div class="summary-value">${totalGt30}</div><div class="summary-label">Total > 30 Menit</div></div>
        <div class="summary-item"><div class="summary-value">${presentase}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item">
          ${renderBadge(presentase, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
      <div class="summary-note" style="margin-top: 20px; padding: 16px; background-color: var(--bg-secondary, #f8f9fa); border-left: 4px solid var(--primary-color, #007bff); border-radius: 4px; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary, #333);">
        <strong>Catatan:</strong><br>
        Berdasarkan data dapat disimpulkan waktu laporan hasil nilai kritis laboratorium < 30 Menit mencapai <strong>${totalLt30}</strong> pasien (<strong>${presentase}%</strong>).
      </div>
    `;
  }
});

export default page;
