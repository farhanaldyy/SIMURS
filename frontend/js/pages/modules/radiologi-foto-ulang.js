import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Kejadian Foto Ulang Pasien',
  subtitle: 'Kejadian foto ulang pemeriksaan radiologi',
  endpoint: '/radiologi-foto-ulang',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    {
      label: 'Detail Kejadian',
      render: (r) => {
        const items = [
          { name: 'over_exposure', abbr: 'OE', label: 'Over Exposure' },
          { name: 'under_exposure', abbr: 'UE', label: 'Under Exposure' },
          { name: 'positioning', abbr: 'P', label: 'Positioning' },
          { name: 'artefac', abbr: 'A', label: 'Artefac' },
          { name: 'equitmen', abbr: 'E', label: 'Equitmen' }
        ];

        const badgesHTML = items.map(item => {
          const val = r[item.name] || 0;
          const badgeClass = val > 0 ? 'badge-danger' : 'badge-success';
          return `<span class="badge ${badgeClass}" style="font-size: 0.72rem; padding: 3px 6px; cursor: help; min-width: 38px; text-align: center;" title="${item.label}: ${val}">${item.abbr}: ${val}</span>`;
        }).join('');

        return `<div style="display: flex; gap: 4px; flex-wrap: nowrap; justify-content: start;">${badgesHTML}</div>`;
      }
    },
    { label: 'Jumlah Pemeriksaan', key: 'jumlah_pemeriksaan' },
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
      name: 'over_exposure',
      label: 'Over Exposure',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'under_exposure',
      label: 'Under Exposure',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'positioning',
      label: 'Positioning',
      type: 'number',
      required: true,
      row: 3
    },
    {
      name: 'artefac',
      label: 'Artefac',
      type: 'number',
      required: true,
      row: 3
    },
    {
      name: 'equitmen',
      label: 'Equitmen',
      type: 'number',
      required: true,
      row: 4
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalOver = s.total_over_exposure || 0;
    const totalUnder = s.total_under_exposure || 0;
    const totalPos = s.total_positioning || 0;
    const totalArt = s.total_artefac || 0;
    const totalEquit = s.total_equitmen || 0;
    const totalKejadian = s.total_kejadian || 0;
    const totalPemeriksaan = s.total_pemeriksaan || 0;
    const persen = s.persen || 0;
    const standar = s.standar || '0%';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalKejadian}</div><div class="summary-label">Total Kejadian</div></div>
        <div class="summary-item"><div class="summary-value">${totalPemeriksaan}</div><div class="summary-label">Total Pemeriksaan</div></div>
        <div class="summary-item"><div class="summary-value">${persen}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item">
          ${renderBadge(persen, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>

      <div class="summary-item" style="border-top-color: var(--color-danger); padding: var(--space-md); text-align: left; margin: 0;">
        <h5 style="margin-top: 0; margin-bottom: 16px; font-weight: 600; font-size: 1rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Rincian Kejadian</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px;">
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Over Exposure</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${totalOver}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Under Exposure</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${totalUnder}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Positioning</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${totalPos}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Artefac</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${totalArt}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Equitmen</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${totalEquit}</div>
          </div>
        </div>
      </div>
    `;
  }
});

export default page;
