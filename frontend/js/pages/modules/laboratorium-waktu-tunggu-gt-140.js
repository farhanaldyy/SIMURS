import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Waktu Tunggu Hasil Lab > 140 Menit',
  subtitle: 'Waktu tunggu hasil pemeriksaan laboratorium (> 140 Menit)',
  endpoint: '/laboratorium-waktu-tunggu-gt-140',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'PRX > 140 Menit / Orang', key: 'prx_gt_140' },
    { 
      label: 'Pasien <= 140 Menit', 
      render: (r) => `${r.pasien_lt_140 || 0}`
    },
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
      name: 'jumlah_pasien',
      label: 'Jumlah Pasien',
      type: 'number',
      required: true,
      row: 1
    },
    {
      name: 'prx_gt_140',
      label: 'PRX > 140 Menit / Orang',
      type: 'number',
      required: true,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalPasien = s.total_pasien || 0;
    const totalPasienGt140 = s.total_pasien_gt_140 || 0;
    const totalPasienLt140 = s.total_pasien_lt_140 || 0;
    const presentase = s.presentase || 0;
    const sisaPresentase = s.sisa_presentase || 0;
    const standar = s.standar || '100%';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasien}</div><div class="summary-label">Total Pasien</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasienGt140}</div><div class="summary-label">Pasien >= 140 Menit</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasienLt140}</div><div class="summary-label">Pasien <= 140 Menit</div></div>
        <div class="summary-item"><div class="summary-value">${presentase}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item">
          ${renderBadge(presentase, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
      <div class="summary-note" style="margin-top: 20px; padding: 16px; background-color: var(--bg-secondary, #f8f9fa); border-left: 4px solid var(--primary-color, #007bff); border-radius: 4px; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary, #333);">
        <strong>Catatan:</strong><br>
        Berdasarkan data dapat disimpulkan bahwa hasil laboratorium <= 140 menit mencapai <strong>${totalPasienLt140}</strong> pasien (<strong>${presentase}%</strong>) dari <strong>${totalPasien}</strong> pasien, jadi masih ada hasil laboratorium >= 140 menit sebanyak <strong>${totalPasienGt140}</strong> pasien (<strong>${sisaPresentase}%</strong>).
      </div>
    `;
  }
});

export default page;
