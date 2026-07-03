import Store from '../store.js';
import { api } from '../api/client.js';

let achievedChartInstance = null;
let statusChartInstance = null;
let currentList = [];

export async function render(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Ringkasan real-time kepatuhan indikator mutu rumah sakit</p>
      </div>
    </div>

    <div class="dashboard-stats" id="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card stat-primary" style="background: var(--color-bg-card); border-left: 4px solid var(--color-primary); padding: 16px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px;">
        <div class="stat-icon" style="font-size: 2rem;">📊</div>
        <div class="stat-info"><h3 style="font-size: 1.5rem; margin: 0;">27</h3><p style="color: var(--color-text-secondary); margin: 0; font-size: 0.85rem;">Total Indikator</p></div>
      </div>
      <div class="stat-card stat-success" style="background: var(--color-bg-card); border-left: 4px solid var(--color-success); padding: 16px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px;">
        <div class="stat-icon" style="font-size: 2rem; color: var(--color-success);">✓</div>
        <div class="stat-info"><h3 id="stat-good" style="font-size: 1.5rem; margin: 0;">-</h3><p style="color: var(--color-text-secondary); margin: 0; font-size: 0.85rem;">Tercapai</p></div>
      </div>
      <div class="stat-card stat-danger" style="background: var(--color-bg-card); border-left: 4px solid var(--color-danger); padding: 16px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px;">
        <div class="stat-icon" style="font-size: 2rem; color: var(--color-danger);">✕</div>
        <div class="stat-info"><h3 id="stat-bad" style="font-size: 1.5rem; margin: 0;">-</h3><p style="color: var(--color-text-secondary); margin: 0; font-size: 0.85rem;">Belum Tercapai</p></div>
      </div>
      <div class="stat-card stat-info" style="background: var(--color-bg-card); border-left: 4px solid var(--color-info); padding: 16px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px;">
        <div class="stat-icon" style="font-size: 2rem; color: var(--color-info);">⚙</div>
        <div class="stat-info"><h3 id="stat-empty" style="font-size: 1.5rem; margin: 0;">-</h3><p style="color: var(--color-text-secondary); margin: 0; font-size: 0.85rem;">Belum Ada Data</p></div>
      </div>
    </div>

    <div class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div class="chart-container card" style="background: var(--color-bg-card); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.1rem;">📊 Kepatuhan Indikator Tercapai</h3>
        <div class="chart-canvas-wrapper" style="height: 280px; position: relative;">
          <canvas id="chart-achieved"></canvas>
        </div>
      </div>
      <div class="chart-container card" style="background: var(--color-bg-card); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.1rem;">📈 Proporsi Status Capaian</h3>
        <div class="chart-canvas-wrapper" style="height: 280px; position: relative; display: flex; justify-content: center;">
          <canvas id="chart-status"></canvas>
        </div>
      </div>
    </div>

    <div class="dashboard-recap card" style="background: var(--color-bg-card); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden;">
      <div class="card-header" style="border-bottom: 1px solid var(--color-border); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <h3 class="card-title" style="margin: 0; font-size: 1.1rem;">Rekapitulasi Capaian Indikator</h3>
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" id="recap-search" placeholder="Cari indikator..." class="form-control" style="width: 240px; padding: 6px 12px; font-size: 0.9rem; border-radius: 4px; border: 1px solid var(--color-border);">
          <select id="recap-filter-status" class="form-control" style="width: 160px; padding: 6px 12px; font-size: 0.9rem; border-radius: 4px; border: 1px solid var(--color-border); background-color: var(--color-bg-card); color: var(--color-text);">
            <option value="all">Semua Status</option>
            <option value="tercapai">Tercapai</option>
            <option value="belum_tercapai">Belum Tercapai</option>
            <option value="no_data">Belum Ada Data</option>
          </select>
        </div>
      </div>
      <div style="padding: 0;">
        <div class="table-container" id="recap-table-container" style="overflow-x: auto;">
          <table class="table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid var(--color-border); background: #f8fafc;">
                <th style="width: 60px; padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">No</th>
                <th style="width: 180px; padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">Kategori</th>
                <th style="padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">Nama Indikator</th>
                <th style="width: 120px; padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">Target</th>
                <th style="width: 150px; padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">Pencapaian</th>
                <th style="width: 160px; padding: 14px 20px; font-weight: 600; color: #475569; font-size: 0.85rem;">Status</th>
              </tr>
            </thead>
            <tbody id="recap-table-body">
              <tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--color-text-secondary)">Memuat rekap data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach search and filter event listeners
  const searchInput = document.getElementById('recap-search');
  const statusFilter = document.getElementById('recap-filter-status');
  if (searchInput) searchInput.addEventListener('input', filterAndRenderRecapTable);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderRecapTable);

  await loadDashboard();
  window.addEventListener('periodeChanged', loadDashboard);
  window.addEventListener('unitChanged', loadDashboard);
}

async function loadDashboard() {
  const pid = Store.periodeAktif?.id;
  const uid = Store.unitAktif?.id;

  if (!pid) return;

  let url = `/dashboard/indicator-summaries?periode_id=${pid}`;
  if (uid) url += `&unit_id=${uid}`;

  const res = await api.get(url);
  if (!res.success) return;

  const data = res.data;
  
  let tercapaiCount = 0;
  let tidakTercapaiCount = 0;
  let belumAdaDataCount = 0;
  
  const formattedList = [];

  for (const [name, s] of Object.entries(data)) {
    let achieved = false;
    let hasilPercent = s.persen;
    let hasilText = `${s.persen || 0}%`;
    const isNegativeIndicator = (name.includes('Kematian') && name !== 'Kejadian Kematian di Meja Operasi') || name.includes('Kembali ICU') || name.includes('Clotting') || name.includes('Ketidakpatuhan') || name === 'Insiden Keselamatan';
    let isNoData = s.total === 0 && !isNegativeIndicator;

    if (name === 'Insiden Keselamatan') {
      hasilPercent = s.total === 0 ? 100 : 0;
      hasilText = `${s.total} Kasus`;
      achieved = s.total === 0;
    } else if (s.rataRata !== undefined) {
      hasilPercent = s.rataRata;
      hasilText = `${s.rataRata}`;
      const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
      const rVal = parseFloat(s.rataRata);
      if (s.standar.includes('≤')) {
        achieved = rVal <= targetVal;
      } else {
        achieved = rVal >= targetVal;
      }
    } else if ((name.includes('Kematian') && name !== 'Kejadian Kematian di Meja Operasi') || name.includes('Kembali ICU') || name.includes('Clotting') || name.includes('Ketidakpatuhan')) {
      hasilPercent = s.total === 0 ? 100 : 0;
      hasilText = `${s.total} Kasus`;
      achieved = s.total === 0;
    } else {
      const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
      const currentVal = parseFloat(s.persen || 0);
      if (s.standar.includes('<')) {
        achieved = currentVal < targetVal;
      } else if (s.standar.includes('≤')) {
        achieved = currentVal <= targetVal;
      } else if (s.standar.includes('≥')) {
        achieved = currentVal >= targetVal;
      } else if (s.standar.includes('>')) {
        achieved = currentVal > targetVal;
      } else {
        achieved = currentVal >= targetVal;
      }
    }

    if (isNoData) {
      belumAdaDataCount++;
    } else if (achieved) {
      tercapaiCount++;
    } else {
      tidakTercapaiCount++;
    }

    formattedList.push({
      name,
      category: s.category,
      standar: s.standar,
      hasilText,
      hasilPercent: isNoData ? 0 : parseFloat(hasilPercent || 0),
      isNoData,
      achieved
    });
  }

  // Update Stats Cards
  document.getElementById('stat-good').textContent = tercapaiCount;
  document.getElementById('stat-bad').textContent = tidakTercapaiCount;
  document.getElementById('stat-empty').textContent = belumAdaDataCount;

  currentList = formattedList;

  // Render Charts and Recap Table
  renderCharts(formattedList, tercapaiCount, tidakTercapaiCount, belumAdaDataCount);
  filterAndRenderRecapTable();
}

function renderCharts(list, good, bad, empty) {
  if (achievedChartInstance) achievedChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();

  const ctxAchieved = document.getElementById('chart-achieved');
  const ctxStatus = document.getElementById('chart-status');

  if (ctxAchieved && typeof Chart !== 'undefined') {
    const sorted = [...list]
      .filter(x => !x.isNoData && x.achieved && !x.name.includes('Kematian') && !x.name.includes('Kembali ICU') && !x.name.includes('Clotting') && !x.name.includes('Ketidakpatuhan'))
      .sort((a, b) => b.hasilPercent - a.hasilPercent)
      .slice(0, 8);

    achievedChartInstance = new Chart(ctxAchieved, {
      type: 'bar',
      data: {
        labels: sorted.map(x => x.name.substring(0, 20) + (x.name.length > 20 ? '..' : '')),
        datasets: [{
          label: 'Kepatuhan (%)',
          data: sorted.map(x => x.hasilPercent),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: 'var(--color-success)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  if (ctxStatus && typeof Chart !== 'undefined') {
    statusChartInstance = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Tercapai', 'Belum Tercapai', 'Belum Ada Data'],
        datasets: [{
          data: [good, bad, empty],
          backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
          borderWidth: 2,
          borderColor: 'var(--color-bg-card)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
        }
      }
    });
  }
}

function filterAndRenderRecapTable() {
  const searchInput = document.getElementById('recap-search');
  const statusFilter = document.getElementById('recap-filter-status');
  
  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
  const statusVal = statusFilter ? statusFilter.value : 'all';

  const filtered = currentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchVal) || item.category.toLowerCase().includes(searchVal);
    
    let matchesStatus = true;
    if (statusVal === 'tercapai') {
      matchesStatus = !item.isNoData && item.achieved;
    } else if (statusVal === 'belum_tercapai') {
      matchesStatus = !item.isNoData && !item.achieved;
    } else if (statusVal === 'no_data') {
      matchesStatus = item.isNoData;
    }
    
    return matchesSearch && matchesStatus;
  });

  const container = document.getElementById('recap-table-body');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-secondary); padding: 24px;">Tidak ada data indikator yang cocok</td></tr>`;
    return;
  }

  const categoryColors = {
    'Keselamatan Pasien': 'background: #e0f2fe; color: #0369a1;',
    'Rawat Inap': 'background: #f3e8ff; color: #6b21a8;',
    'IGD': 'background: #fef3c7; color: #92400e;',
    'Hemodialisa': 'background: #f1f5f9; color: #475569;',
    'Operasi & Anestesi': 'background: #ffe4e6; color: #9f1239;',
  };

  const rows = filtered.map((item, idx) => {
    let badgeStyle = '';
    let statusText = '';

    if (item.isNoData) {
      statusText = 'Belum Ada Data';
      badgeStyle = 'background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;';
    } else if (item.achieved) {
      statusText = 'Tercapai';
      badgeStyle = 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
    } else {
      statusText = 'Belum Tercapai';
      badgeStyle = 'background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;';
    }

    const catStyle = categoryColors[item.category] || 'background: #f1f5f9; color: #475569;';

    return `
      <tr style="border-bottom: 1px solid var(--color-border); transition: background-color 0.2s;">
        <td style="padding: 14px 20px; color: #64748b; font-size: 0.9rem;">${idx + 1}</td>
        <td style="padding: 14px 20px;"><span style="font-size: 0.8rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; display: inline-block; ${catStyle}">${item.category}</span></td>
        <td style="padding: 14px 20px; font-weight: 500; color: #1e293b; font-size: 0.95rem;">${item.name}</td>
        <td style="padding: 14px 20px; color: #475569; font-size: 0.9rem;">${item.standar}</td>
        <td style="padding: 14px 20px; font-weight: 700; color: #0f172a; font-size: 0.95rem;">${item.hasilText}</td>
        <td style="padding: 14px 20px;"><span style="display: inline-block; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 9999px; ${badgeStyle}">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  container.innerHTML = rows;
}

export function destroy() {
  if (achievedChartInstance) { achievedChartInstance.destroy(); achievedChartInstance = null; }
  if (statusChartInstance) { statusChartInstance.destroy(); statusChartInstance = null; }
  window.removeEventListener('periodeChanged', loadDashboard);
  window.removeEventListener('unitChanged', loadDashboard);
}
