import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Kelengkapan Pemberian Info Tindakan',
  subtitle: 'Kelengkapan pengisian form pemberian info tindakan radiologi',
  endpoint: '/radiologi-info-tindakan',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pemeriksaan', key: 'jumlah_pemeriksaan' },
    { label: 'Kepatuhan Pengisian', key: 'kepatuhan_pengisian' },
    { 
      label: 'Hasil', 
      render: (r) => `${r.hasil || 0}%`
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
      name: 'jumlah_pemeriksaan',
      label: 'Jumlah Pemeriksaan',
      type: 'number',
      required: true,
      row: 1
    },
    {
      name: 'kepatuhan_pengisian',
      label: 'Kepatuhan Pengisian',
      type: 'number',
      required: true,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const numerator = s.numerator || 0;
    const denominator = s.denominator || 0;
    const persen = s.persen || 0;
    const standar = s.standar || '≥ 85%';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${numerator}</div><div class="summary-label">Kepatuhan Pengisian (Numerator)</div></div>
        <div class="summary-item"><div class="summary-value">${denominator}</div><div class="summary-label">Jumlah Pemeriksaan (Denominator)</div></div>
        <div class="summary-item"><div class="summary-value">${persen}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item">
          ${renderBadge(persen, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
    `;
  }
});

export default page;
