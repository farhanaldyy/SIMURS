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
      <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; width: 100%;">
        <div class="summary-item" style="margin: 0;"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item" style="margin: 0;"><div class="summary-value">${totalKejadian}</div><div class="summary-label">Total Kejadian</div></div>
        <div class="summary-item" style="margin: 0;"><div class="summary-value">${totalPemeriksaan}</div><div class="summary-label">Total Pemeriksaan</div></div>
        <div class="summary-item" style="margin: 0;"><div class="summary-value">${persen}%</div><div class="summary-label">Persentase</div></div>
        <div class="summary-item" style="margin: 0;">
          ${renderBadge(persen, standar)}
          <div class="summary-label" style="margin-top:6px">Standar: ${standar}</div>
        </div>
      </div>

      <div style="grid-column: 1 / -1; width: 100%; background: var(--color-bg-card, #ffffff); border: 1px solid var(--color-border, #e2e8f0); border-left: 4px solid var(--color-danger, #ef4444); border-radius: var(--radius-sm, 6px); padding: 12px 16px; margin-top: 4px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
            <span style="font-size: 0.95rem;">⚠️</span> Rincian Kejadian Foto Ulang
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; flex: 1; justify-content: flex-end;">
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.82rem;">
              <span style="color: var(--color-text-secondary); font-weight: 500;">Over Exposure:</span>
              <strong style="font-weight: 700; color: ${totalOver > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-text)'};">${totalOver}</strong>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.82rem;">
              <span style="color: var(--color-text-secondary); font-weight: 500;">Under Exposure:</span>
              <strong style="font-weight: 700; color: ${totalUnder > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-text)'};">${totalUnder}</strong>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.82rem;">
              <span style="color: var(--color-text-secondary); font-weight: 500;">Positioning:</span>
              <strong style="font-weight: 700; color: ${totalPos > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-text)'};">${totalPos}</strong>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.82rem;">
              <span style="color: var(--color-text-secondary); font-weight: 500;">Artefac:</span>
              <strong style="font-weight: 700; color: ${totalArt > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-text)'};">${totalArt}</strong>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--color-bg, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.82rem;">
              <span style="color: var(--color-text-secondary); font-weight: 500;">Equitmen:</span>
              <strong style="font-weight: 700; color: ${totalEquit > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-text)'};">${totalEquit}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }
});

export default page;
