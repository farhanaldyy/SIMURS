import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Waktu Tunggu Hasil Lab < 140 Menit',
  subtitle: 'Waktu tunggu hasil pemeriksaan laboratorium (< 140 Menit)',
  endpoint: '/laboratorium-waktu-tunggu-lt-140',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Waktu (Menit)', key: 'waktu' },
    { 
      label: 'Hasil (Rata-rata Waktu)', 
      render: (r) => `${r.hasil || 0} menit`
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
      name: 'waktu',
      label: 'Waktu (Menit)',
      type: 'number',
      required: true,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalPasien = s.total_pasien || 0;
    const totalWaktu = s.total_waktu || 0;
    const rataRata = s.rataRata || 0;
    const standar = s.standar || '≤ 140 menit';
    
    const isCompliant = rataRata <= 140;
    const statusText = isCompliant 
      ? 'sudah memenuhi standar yang ditentukan' 
      : 'belum memenuhi standar yang ditentukan';
      
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasien}</div><div class="summary-label">Total Pasien</div></div>
        <div class="summary-item"><div class="summary-value">${totalWaktu}</div><div class="summary-label">Total Waktu (Menit)</div></div>
        <div class="summary-item"><div class="summary-value">${rataRata} menit</div><div class="summary-label">Rata-rata Waktu</div></div>
        <div class="summary-item">
          ${renderBadge(rataRata, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
      <div class="summary-note" style="margin-top: 20px; padding: 16px; background-color: var(--bg-secondary, #f8f9fa); border-left: 4px solid var(--primary-color, #007bff); border-radius: 4px; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary, #333);">
        <strong>Catatan:</strong><br>
        Berdasarkan data dapat disimpulkan bahwa hasil laboratorium dengan rata-rata <strong>${rataRata} menit</strong> dari <strong>${totalPasien}</strong> sampel dalam satu bulan.<br>
        Standar pelayanan laboratorium yang ditetapkan oleh Menkes 2008: &le; 140 menit, sehingga dapat disimpulkan bahwa pelayanan laboratorium <strong>${statusText}</strong>.
      </div>
    `;
  }
});

export default page;
