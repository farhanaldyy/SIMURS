import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';

const page = createGenericIndicatorPage({
  title: 'Tidak Adanya Kesalahan Input Lab',
  subtitle: 'Tidak adanya kesalahan hasil input pemeriksaan lab',
  endpoint: '/laboratorium-kesalahan-input',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Jumlah Kesalahan', key: 'jumlah_kesalahan' },
    { label: 'Keterangan', key: 'keterangan' },
    { 
      label: 'Persentase Bebas Kesalahan', 
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
      name: 'jumlah_kesalahan',
      label: 'Jumlah Kesalahan',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'keterangan',
      label: 'Keterangan (Opsional)',
      type: 'textarea',
      required: false,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalPasien = s.total_pasien || 0;
    const totalKesalahan = s.total_kesalahan || 0;
    const presentase = s.presentase !== undefined ? s.presentase : 100;
    const standar = s.standar || '100%';
    
    const isCompliant = presentase >= 100;
    const statusText = isCompliant 
      ? 'memenuhi standar yang ditentukan' 
      : 'belum memenuhi standar yang ditentukan';
      
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasien}</div><div class="summary-label">Total Pasien</div></div>
        <div class="summary-item"><div class="summary-value">${totalKesalahan}</div><div class="summary-label">Total Kesalahan</div></div>
        <div class="summary-item"><div class="summary-value">${presentase}%</div><div class="summary-label">Persentase Bebas Kesalahan</div></div>
        <div class="summary-item">
          ${renderBadge(presentase, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
      <div class="summary-note" style="margin-top: 20px; padding: 16px; background-color: var(--bg-secondary, #f8f9fa); border-left: 4px solid var(--primary-color, #007bff); border-radius: 4px; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary, #333);">
        <strong>Catatan:</strong><br>
        Berdasarkan data dapat disimpulkan bahwa <strong>${presentase}%</strong> tidak adanya kesalahan penginputan hasil pemeriksaan laboratorium.<br>
        Standar pelayanan laboratorium yang ditetapkan oleh kemenkes 2008: 100%, sehingga dapat disimpulkan bahwa pelayanan laboratorium <strong>${statusText}</strong>.
      </div>
    `;
  }
});

export default page;
