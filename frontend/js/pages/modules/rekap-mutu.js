import { api } from '../../api/client.js';

let currentKategori = 'rawat_inap';
let currentTahun = 2026;
let currentBulanAwal = 1;
let currentBulanAkhir = 3; // Default 3 Bulan (Januari - Maret)

// Soft Harmonious Monthly Color Palette
const MONTH_PALETTES = [
  { headerBg: '#dbeafe', subBg: '#eff6ff', capBg: '#bfdbfe', capCellBg: '#e0f2fe', textColor: '#1e3a8a' }, // Jan - Soft Blue
  { headerBg: '#d1fae5', subBg: '#ecfdf5', capBg: '#a7f3d0', capCellBg: '#d1fae5', textColor: '#065f46' }, // Feb - Soft Emerald
  { headerBg: '#fef3c7', subBg: '#fffbeb', capBg: '#fde68a', capCellBg: '#fef9c3', textColor: '#92400e' }, // Mar - Soft Amber
  { headerBg: '#e9d5ff', subBg: '#faf5ff', capBg: '#d8b4fe', capCellBg: '#f3e8ff', textColor: '#5b21b6' }, // Apr - Soft Purple
  { headerBg: '#fecdd3', subBg: '#fff1f2', capBg: '#fda4af', capCellBg: '#ffe4e6', textColor: '#9f1239' }, // May - Soft Rose
  { headerBg: '#cff4fc', subBg: '#f0fdfa', capBg: '#a5f3fc', capCellBg: '#e0f7fa', textColor: '#155e75' }, // Jun - Soft Cyan
  { headerBg: '#ffedd5', subBg: '#fff7ed', capBg: '#fed7aa', capCellBg: '#ffedd5', textColor: '#9a3412' }, // Jul - Soft Orange
  { headerBg: '#e2e8f0', subBg: '#f8fafc', capBg: '#cbd5e1', capCellBg: '#f1f5f9', textColor: '#334155' }, // Aug - Soft Slate
  { headerBg: '#d9f99d', subBg: '#f7fee7', capBg: '#bef264', capCellBg: '#ecfccb', textColor: '#3f6212' }, // Sep - Soft Lime
  { headerBg: '#fbcfe8', subBg: '#fdf2f8', capBg: '#f472b6', capCellBg: '#fce7f3', textColor: '#831843' }, // Oct - Soft Pink
  { headerBg: '#ccfbf1', subBg: '#f0fdfa', capBg: '#99f6e4', capCellBg: '#e6fffa', textColor: '#115e59' }, // Nov - Soft Teal
  { headerBg: '#e0e7ff', subBg: '#eef2ff', capBg: '#c7d2fe', capCellBg: '#e0e7ff', textColor: '#3730a3' }, // Dec - Soft Indigo
];

function getMonthPalette(monthNum) {
  const idx = (monthNum - 1) % MONTH_PALETTES.length;
  return MONTH_PALETTES[idx];
}

export async function render(container) {
  container.innerHTML = `
    <div class="card" style="position: sticky; top: var(--header-height, 60px); z-index: 80; margin-bottom: 12px; padding: 10px 14px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            📊 Rekap Data Mutu
          </h2>
          <span style="color: #64748b; font-size: 0.75rem; border-left: 2px solid #cbd5e1; padding-left: 8px; font-weight: 500;">
            Agregasi capaian mutu unit & ruangan
          </span>
        </div>

        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 3px;">
            <label style="font-weight: 600; font-size: 0.75rem; color: #475569;">Tahun:</label>
            <select id="rekap-tahun-select" class="form-control" style="width: 78px; padding: 2px 5px; border-radius: 5px; font-size: 0.78rem; height: 28px;">
              <option value="2026" ${currentTahun === 2026 ? 'selected' : ''}>2026</option>
              <option value="2025" ${currentTahun === 2025 ? 'selected' : ''}>2025</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 3px;">
            <label style="font-weight: 600; font-size: 0.75rem; color: #475569;">Bulan:</label>
            <select id="rekap-bulan-awal" class="form-control" style="width: 95px; padding: 2px 5px; border-radius: 5px; font-size: 0.78rem; height: 28px;">
              ${renderBulanOptions(currentBulanAwal)}
            </select>
            <span style="color: #64748b; font-size: 0.75rem;">s/d</span>
            <select id="rekap-bulan-akhir" class="form-control" style="width: 95px; padding: 2px 5px; border-radius: 5px; font-size: 0.78rem; height: 28px;">
              ${renderBulanOptions(currentBulanAkhir)}
            </select>
          </div>

          <button id="btn-apply-filter" class="btn btn-primary" style="padding: 3px 10px; border-radius: 5px; font-weight: 600; font-size: 0.78rem; height: 28px; display: inline-flex; align-items: center; gap: 3px;">
            🔍 Tampilkan
          </button>
          
          <button id="btn-export-excel" class="btn" style="background: #10b981; color: white; border: none; padding: 3px 10px; border-radius: 5px; font-weight: 600; font-size: 0.78rem; height: 28px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
            📥 Export Excel
          </button>
        </div>
      </div>

      <!-- Category Sub-Menu / Tabs -->
      <div style="margin-top: 8px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 4px; overflow-x: auto; padding-bottom: 0;">
        <button class="tab-btn active-tab" data-kategori="rawat_inap" style="padding: 4px 12px; border: none; background: none; font-weight: 600; font-size: 0.8rem; cursor: pointer; border-bottom: 2px solid #3b82f6; color: #2563eb;">
          🛏️ Rawat Inap
        </button>
        <button class="tab-btn disabled-tab" data-kategori="igd" style="padding: 4px 12px; border: none; background: none; font-weight: 500; font-size: 0.8rem; color: #94a3b8; cursor: not-allowed;" title="Akan hadir selanjutnya">
          🚨 IGD (Segera)
        </button>
        <button class="tab-btn disabled-tab" data-kategori="rawat_jalan" style="padding: 4px 12px; border: none; background: none; font-weight: 500; font-size: 0.8rem; color: #94a3b8; cursor: not-allowed;" title="Akan hadir selanjutnya">
          🚶 Rawat Jalan (Segera)
        </button>
        <button class="tab-btn disabled-tab" data-kategori="farmasi" style="padding: 4px 12px; border: none; background: none; font-weight: 500; font-size: 0.8rem; color: #94a3b8; cursor: not-allowed;" title="Akan hadir selanjutnya">
          💊 Farmasi (Segera)
        </button>
      </div>
    </div>

    <!-- Content Container -->
    <div id="rekap-content-container">
      <div style="text-align: center; padding: 30px; color: #64748b;">
        <div class="spinner" style="margin-bottom: 10px;"></div>
        Memuat data rekap mutu unit...
      </div>
    </div>
  `;

  // Attach Event Listeners
  document.getElementById('btn-apply-filter').addEventListener('click', () => {
    currentTahun = parseInt(document.getElementById('rekap-tahun-select').value);
    currentBulanAwal = parseInt(document.getElementById('rekap-bulan-awal').value);
    currentBulanAkhir = parseInt(document.getElementById('rekap-bulan-akhir').value);
    loadData();
  });

  document.getElementById('btn-export-excel').addEventListener('click', async () => {
    const endpoint = `/rekap-mutu/excel?kategori=${currentKategori}&tahun=${currentTahun}&bulanAwal=${currentBulanAwal}&bulanAkhir=${currentBulanAkhir}`;
    const filename = `Rekap_Mutu_${currentKategori}_${currentTahun}_Bulan_${currentBulanAwal}-${currentBulanAkhir}.xlsx`;
    await api.download(endpoint, filename);
  });

  // Initial Data Load
  await loadData();
}

function renderBulanOptions(selectedVal) {
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return bulanList.map((nama, idx) => {
    const val = idx + 1;
    return `<option value="${val}" ${val === selectedVal ? 'selected' : ''}>${nama}</option>`;
  }).join('');
}

async function loadData() {
  const container = document.getElementById('rekap-content-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 30px; color: #64748b;">
      <div class="spinner" style="margin-bottom: 10px;"></div>
      Sedang mengambil data rekap mutu...
    </div>
  `;

  try {
    const query = `kategori=${currentKategori}&tahun=${currentTahun}&bulanAwal=${currentBulanAwal}&bulanAkhir=${currentBulanAkhir}`;
    const res = await api.get(`/rekap-mutu?${query}`);

    if (!res.success || !res.data) {
      container.innerHTML = `<div class="alert alert-warning">Gagal memuat data rekapitulasi.</div>`;
      return;
    }

    const data = res.data;
    renderMatrixTables(container, data);
  } catch (err) {
    console.error('Failed to load rekap data:', err);
    container.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan: ${err.message}</div>`;
  }
}

function renderMatrixTables(container, data) {
  let html = '';

  // Legend guide for N, D, C abbreviations
  const legendHTML = `
    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.75rem; color: #475569;">
      <div>
        <strong>💡 Keterangan Kolom:</strong> 
        <span style="margin-left: 6px; color: #1e293b;"><strong>N</strong> = Numerator</span> | 
        <span style="margin-left: 4px; color: #1e293b;"><strong>D</strong> = Denumerator</span> | 
        <span style="margin-left: 4px; color: #2563eb; font-weight: 700;"><strong>C</strong> = Capaian (%)</span>
      </div>
      <div style="color: #64748b; font-size: 0.72rem;">
        *Setiap bulan memiliki palet warna berbeda untuk mempermudah identifikasi data
      </div>
    </div>
  `;

  html += legendHTML;

  // 1. Render Room Tables
  data.rooms.forEach((room) => {
    html += `
      <div class="card" style="margin-bottom: 20px; padding: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #cbd5e1;">
        <div style="background: #1e293b; color: white; padding: 8px 14px; font-weight: 700; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center;">
          <span>🏥 RUANGAN: ${room.nama_unit}</span>
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-weight: 500;">
            ${data.tahun} (${data.bulanList.length} Bulan)
          </span>
        </div>

        <div style="overflow-x: auto; max-width: 100%; position: relative;">
          <table class="table-compact-matrix" style="width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.75rem; line-height: 1.2;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th rowspan="2" style="position: sticky; left: 0; z-index: 10; background: #f1f5f9; width: 28px; min-width: 28px; text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; vertical-align: middle; padding: 3px;">No</th>
                <th rowspan="2" style="position: sticky; left: 28px; z-index: 10; background: #f1f5f9; min-width: 180px; max-width: 180px; border-right: 2px solid #94a3b8; border-bottom: 1px solid #cbd5e1; vertical-align: middle; padding: 4px 6px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">Indikator Mutu</th>
                ${data.bulanList.map(b => {
                  const pal = getMonthPalette(b.bulan);
                  return `
                    <th colspan="3" style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; background: ${pal.headerBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">
                      ${b.nama}
                    </th>
                  `;
                }).join('')}
              </tr>
              <tr style="background: #f8fafc;">
                ${data.bulanList.map(b => {
                  const pal = getMonthPalette(b.bulan);
                  return `
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 38px; min-width: 38px; max-width: 38px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 3px 1px;">N</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 38px; min-width: 38px; max-width: 38px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 3px 1px;">D</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 44px; min-width: 44px; max-width: 44px; font-size: 0.7rem; background: ${pal.capBg}; color: ${pal.textColor}; font-weight: 700; padding: 3px 1px;">C</th>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${room.indicators.map((ind, idx) => {
                const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                return `
                  <tr style="background: ${rowBg};">
                    <td style="position: sticky; left: 0; z-index: 5; background: ${rowBg}; text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; padding: 3px;">${ind.no}</td>
                    <td style="position: sticky; left: 28px; z-index: 5; background: ${rowBg}; border-right: 2px solid #94a3b8; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">
                      <div style="font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: normal;">${ind.nama_modul}</div>
                      <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">Standar: ${ind.standar}</div>
                    </td>
                    ${data.bulanList.map(b => {
                      const pal = getMonthPalette(b.bulan);
                      const mData = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
                      return `
                        <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; color: #334155; white-space: nowrap;">${mData.numerator}</td>
                        <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; color: #334155; white-space: nowrap;">${mData.denominator}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; font-weight: 700; color: ${pal.textColor}; background: ${pal.capCellBg}; white-space: nowrap;">
                          ${mData.capaian}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  // 2. Render Aggregated TOTAL MUTU RS Table
  html += `
    <div class="card" style="margin-bottom: 20px; padding: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 2px solid #2563eb;">
      <div style="background: #1e40af; color: white; padding: 8px 14px; font-weight: 700; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center;">
        <span>🏆 TOTAL CAPAIAN MUTU RUMAH SAKIT (GABUNGAN SEMUA RUANGAN)</span>
        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-weight: 500;">
          Rekapitulasi RS
        </span>
      </div>

      <div style="overflow-x: auto; max-width: 100%; position: relative;">
        <table class="table-compact-matrix" style="width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.75rem; line-height: 1.2;">
          <thead>
            <tr style="background: #eff6ff;">
              <th rowspan="2" style="position: sticky; left: 0; z-index: 10; background: #eff6ff; width: 28px; min-width: 28px; text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; vertical-align: middle; padding: 3px;">No</th>
              <th rowspan="2" style="position: sticky; left: 28px; z-index: 10; background: #eff6ff; min-width: 180px; max-width: 180px; border-right: 2px solid #3b82f6; border-bottom: 1px solid #bfdbfe; vertical-align: middle; padding: 4px 6px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">Indikator Mutu</th>
              ${data.bulanList.map(b => {
                const pal = getMonthPalette(b.bulan);
                return `
                  <th colspan="3" style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; background: ${pal.headerBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">
                    MUTU RS ${b.nama}
                  </th>
                `;
              }).join('')}
            </tr>
            <tr style="background: #f0f9ff;">
              ${data.bulanList.map(b => {
                const pal = getMonthPalette(b.bulan);
                return `
                  <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 38px; min-width: 38px; max-width: 38px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 3px 1px;">Tot N</th>
                  <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 38px; min-width: 38px; max-width: 38px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 3px 1px;">Tot D</th>
                  <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 44px; min-width: 44px; max-width: 44px; font-size: 0.7rem; background: ${pal.capBg}; color: ${pal.textColor}; font-weight: 700; padding: 3px 1px;">C</th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.totalRs.map((ind, idx) => {
              const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
              return `
                <tr style="background: ${rowBg};">
                  <td style="position: sticky; left: 0; z-index: 5; background: ${rowBg}; text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; padding: 3px;">${ind.no}</td>
                  <td style="position: sticky; left: 28px; z-index: 5; background: ${rowBg}; border-right: 2px solid #3b82f6; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">
                    <div style="font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: normal;">${ind.nama_modul}</div>
                    <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">Standar: ${ind.standar}</div>
                  </td>
                  ${data.bulanList.map(b => {
                    const pal = getMonthPalette(b.bulan);
                    const mData = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
                    return `
                      <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; font-weight: 600; color: #334155; white-space: nowrap;">${mData.numerator}</td>
                      <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; font-weight: 600; color: #334155; white-space: nowrap;">${mData.denominator}</td>
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 3px 2px; font-weight: 700; color: ${pal.textColor}; background: ${pal.capCellBg}; white-space: nowrap;">
                        ${mData.capaian}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
