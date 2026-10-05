import { api } from '../../api/client.js';

let currentKategori = 'rawat_inap';
let currentTahun = 2026;
let currentBulanAwal = 1;
let currentBulanAkhir = 3; // Default Triwulan 1 (Januari - Maret)
let currentUnitId = 'all'; // Default '-- Semua Unit --'
let currentViewMode = 'executive'; // 'executive' (Compact TW & Sem) or 'detail' (Full Months)

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
    <div class="card" style="position: sticky; top: var(--header-height, 60px); z-index: 80; margin-bottom: 8px; padding: 6px 10px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #cbd5e1; border-radius: 6px;">

      <!-- Row 1: Header Title & Action Buttons -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <h2 style="margin: 0; font-size: 0.9rem; color: #0f172a; font-weight: 700; display: flex; align-items: center; gap: 5px;">
            📊 Rekap Data Mutu
          </h2>
          <span style="color: #64748b; font-size: 0.68rem; border-left: 2px solid #cbd5e1; padding-left: 6px; font-weight: 500;">
            Agregasi & Capaian Indikator Unit
          </span>
        </div>

        <div style="display: flex; gap: 4px; align-items: center;">
          <button id="btn-reset-filter" class="btn" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.7rem; height: 24px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" title="Reset filter ke default (Triwulan I 2026)">
            🔄 Reset
          </button>

          <button id="btn-export-excel" class="btn" style="background: #10b981; color: white; border: none; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 0.7rem; height: 24px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; box-shadow: 0 1px 3px rgba(16,185,129,0.2);">
            📥 Export Excel
          </button>
        </div>
      </div>

      <!-- Row 2: Filter Toolbar (Ultra Compact for 720p+ Screens) -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; display: flex; flex-wrap: nowrap; overflow-x: auto; align-items: center; gap: 4px 6px; scrollbar-width: thin;">

        <!-- Filter Triwulan -->
        <div style="display: flex; align-items: center; gap: 3px; background: #eff6ff; padding: 1px 6px; border-radius: 4px; border: 1px solid #bfdbfe; flex-shrink: 0;">
          <label style="font-weight: 700; font-size: 0.68rem; color: #1e40af;">📊 Triwulan:</label>
          <select id="rekap-triwulan-select" class="form-control" style="width: 112px; padding: 1px 3px; border-radius: 3px; font-size: 0.68rem; height: 22px; background: #ffffff; font-weight: 600; color: #1e40af; border: 1px solid #93c5fd;">
            <option value="none">-- Kustom --</option>
            <option value="tw1" selected>TW I (Jan-Mar)</option>
            <option value="tw2">TW II (Apr-Jun)</option>
            <option value="tw3">TW III (Jul-Sep)</option>
            <option value="tw4">TW IV (Okt-Des)</option>
          </select>
        </div>

        <!-- Filter Semester -->
        <div style="display: flex; align-items: center; gap: 3px; background: #fef3c7; padding: 1px 6px; border-radius: 4px; border: 1px solid #fde68a; flex-shrink: 0;">
          <label style="font-weight: 700; font-size: 0.68rem; color: #92400e;">📙 Semester:</label>
          <select id="rekap-semester-select" class="form-control" style="width: 115px; padding: 1px 3px; border-radius: 3px; font-size: 0.68rem; height: 22px; background: #ffffff; font-weight: 600; color: #92400e; border: 1px solid #fcd34d;">
            <option value="none" selected>-- Kustom --</option>
            <option value="sem1">Sem I (Jan-Jun)</option>
            <option value="sem2">Sem II (Jul-Des)</option>
          </select>
        </div>

        <!-- Filter Rentang Bulan Manual -->
        <div id="container-filter-bulan" style="display: flex; align-items: center; gap: 3px; background: #ffffff; padding: 1px 6px; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0; transition: opacity 0.2s ease;">
          <label style="font-weight: 600; font-size: 0.68rem; color: #475569;">Bulan:</label>
          <select id="rekap-bulan-awal" class="form-control" style="width: 72px; padding: 1px 2px; border-radius: 3px; font-size: 0.68rem; height: 22px;">
            ${renderBulanOptions(currentBulanAwal)}
          </select>
          <span style="color: #64748b; font-size: 0.65rem;">s/d</span>
          <select id="rekap-bulan-akhir" class="form-control" style="width: 72px; padding: 1px 2px; border-radius: 3px; font-size: 0.68rem; height: 22px;">
            ${renderBulanOptions(currentBulanAkhir)}
          </select>
        </div>

        <!-- Filter Unit Spesifik -->
        <div style="display: flex; align-items: center; gap: 3px; background: #ffffff; padding: 1px 6px; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;">
          <label style="font-weight: 600; font-size: 0.68rem; color: #334155;">Unit:</label>
          <select id="rekap-unit-select" class="form-control" style="width: 115px; padding: 1px 3px; border-radius: 3px; font-size: 0.68rem; height: 22px; font-weight: 600; color: #0f172a;">
            <option value="all">-- Semua Unit --</option>
          </select>
        </div>

        <!-- Filter Tahun -->
        <div style="display: flex; align-items: center; gap: 3px; background: #ffffff; padding: 1px 6px; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;">
          <label style="font-weight: 600; font-size: 0.68rem; color: #334155;">Tahun:</label>
          <select id="rekap-tahun-select" class="form-control" style="width: 58px; padding: 1px 2px; border-radius: 3px; font-size: 0.68rem; height: 22px; font-weight: 600;">
            <option value="2026" ${currentTahun === 2026 ? 'selected' : ''}>2026</option>
            <option value="2025" ${currentTahun === 2025 ? 'selected' : ''}>2025</option>
          </select>
        </div>
      </div>

      <!-- Row 3: Category Sub-Menu Tabs (Horizontal Scrollable Pill Bar) -->
      <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin;">
        <button class="tab-btn ${currentKategori === 'inm' ? 'active-tab' : ''}" data-kategori="inm" style="padding: 4px 12px; border: none; background: ${currentKategori === 'inm' ? '#ecfdf5' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'inm' ? '#047857' : '#64748b'}; border: 1px solid ${currentKategori === 'inm' ? '#a7f3d0' : 'transparent'}; white-space: nowrap;">
          🇮🇩 INM (Indikator Nasional Mutu)
        </button>
        <button class="tab-btn ${currentKategori === 'rawat_inap' ? 'active-tab' : ''}" data-kategori="rawat_inap" style="padding: 4px 12px; border: none; background: ${currentKategori === 'rawat_inap' ? '#eff6ff' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'rawat_inap' ? '#2563eb' : '#64748b'}; border: 1px solid ${currentKategori === 'rawat_inap' ? '#bfdbfe' : 'transparent'}; white-space: nowrap;">
          🛏️ Rawat Inap (Umum)
        </button>
        <button class="tab-btn ${currentKategori === 'unit_khusus' ? 'active-tab' : ''}" data-kategori="unit_khusus" style="padding: 4px 12px; border: none; background: ${currentKategori === 'unit_khusus' ? '#fce7f3' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'unit_khusus' ? '#be185d' : '#64748b'}; border: 1px solid ${currentKategori === 'unit_khusus' ? '#fbcfe8' : 'transparent'}; white-space: nowrap;">
          🏥 Unit Khusus
        </button>
        <button class="tab-btn ${currentKategori === 'igd' ? 'active-tab' : ''}" data-kategori="igd" style="padding: 4px 12px; border: none; background: ${currentKategori === 'igd' ? '#fee2e2' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'igd' ? '#b91c1c' : '#64748b'}; border: 1px solid ${currentKategori === 'igd' ? '#fca5a5' : 'transparent'}; white-space: nowrap;">
          🚨 IGD
        </button>
        <button class="tab-btn ${currentKategori === 'rawat_jalan' ? 'active-tab' : ''}" data-kategori="rawat_jalan" style="padding: 4px 12px; border: none; background: ${currentKategori === 'rawat_jalan' ? '#fef3c7' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'rawat_jalan' ? '#b45309' : '#64748b'}; border: 1px solid ${currentKategori === 'rawat_jalan' ? '#fde68a' : 'transparent'}; white-space: nowrap;">
          🚶 Rawat Jalan
        </button>
        <button class="tab-btn ${currentKategori === 'farmasi' ? 'active-tab' : ''}" data-kategori="farmasi" style="padding: 4px 12px; border: none; background: ${currentKategori === 'farmasi' ? '#f3e8ff' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'farmasi' ? '#7e22ce' : '#64748b'}; border: 1px solid ${currentKategori === 'farmasi' ? '#d8b4fe' : 'transparent'}; white-space: nowrap;">
          💊 Farmasi
        </button>
        <button class="tab-btn ${currentKategori === 'penunjang' ? 'active-tab' : ''}" data-kategori="penunjang" style="padding: 4px 12px; border: none; background: ${currentKategori === 'penunjang' ? '#f1f5f9' : 'transparent'}; font-weight: 600; font-size: 0.76rem; cursor: pointer; border-radius: 5px; color: ${currentKategori === 'penunjang' ? '#334155' : '#64748b'}; border: 1px solid ${currentKategori === 'penunjang' ? '#cbd5e1' : 'transparent'}; white-space: nowrap;">
          🛠️ Penunjang
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

  const twSelect = document.getElementById('rekap-triwulan-select');
  const semSelect = document.getElementById('rekap-semester-select');
  const bAwalSelect = document.getElementById('rekap-bulan-awal');
  const bAkhirSelect = document.getElementById('rekap-bulan-akhir');
  const unitSelect = document.getElementById('rekap-unit-select');
  const tahunSelect = document.getElementById('rekap-tahun-select');
  const containerBulan = document.getElementById('container-filter-bulan');
  const btnReset = document.getElementById('btn-reset-filter');

  function updateFilterState() {
    const isPresetMode = twSelect.value !== 'none' || semSelect.value !== 'none';
    if (isPresetMode) {
      bAwalSelect.disabled = true;
      bAkhirSelect.disabled = true;
      containerBulan.style.opacity = '0.5';
      containerBulan.style.pointerEvents = 'none';
    } else {
      bAwalSelect.disabled = false;
      bAkhirSelect.disabled = false;
      containerBulan.style.opacity = '1';
      containerBulan.style.pointerEvents = 'auto';
    }
  }

  updateFilterState();

  const tabStyles = {
    inm: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    rawat_inap: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    unit_khusus: { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' },
    igd: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
    rawat_jalan: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    farmasi: { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },
    penunjang: { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
  };

  function updateTabPillStyles() {
    document.querySelectorAll('.tab-btn').forEach(b => {
      const kat = b.dataset.kategori;
      if (kat === currentKategori) {
        const style = tabStyles[kat] || tabStyles.rawat_inap;
        b.classList.add('active-tab');
        b.style.background = style.bg;
        b.style.color = style.color;
        b.style.borderColor = style.border;
      } else {
        b.classList.remove('active-tab');
        b.style.background = 'transparent';
        b.style.color = '#64748b';
        b.style.borderColor = 'transparent';
      }
    });
  }

  // Category Tab Click Listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const kat = btn.dataset.kategori;
      if (kat) {
        currentKategori = kat;
        currentUnitId = 'all'; // Reset unit selection on category switch
        updateTabPillStyles();
        loadData();
      }
    });
  });

  // Handle Unit Select
  if (unitSelect) {
    unitSelect.addEventListener('change', (e) => {
      currentUnitId = e.target.value;
      loadData();
    });
  }

  function updateFilterState() {
    const isPresetMode = twSelect.value !== 'none' || semSelect.value !== 'none';
    if (isPresetMode) {
      bAwalSelect.disabled = true;
      bAkhirSelect.disabled = true;
      containerBulan.style.opacity = '0.5';
      containerBulan.style.pointerEvents = 'none';
    } else {
      bAwalSelect.disabled = false;
      bAkhirSelect.disabled = false;
      containerBulan.style.opacity = '1';
      containerBulan.style.pointerEvents = 'auto';
    }
  }

  updateFilterState();

  // Handle Triwulan Select
  twSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'none') {
      semSelect.value = 'none'; // Unselect Semester
      if (val === 'tw1') { currentBulanAwal = 1; currentBulanAkhir = 3; }
      else if (val === 'tw2') { currentBulanAwal = 4; currentBulanAkhir = 6; }
      else if (val === 'tw3') { currentBulanAwal = 7; currentBulanAkhir = 9; }
      else if (val === 'tw4') { currentBulanAwal = 10; currentBulanAkhir = 12; }

      bAwalSelect.value = currentBulanAwal;
      bAkhirSelect.value = currentBulanAkhir;
    }
    updateFilterState();
    loadData();
  });

  // Handle Semester Select
  semSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'none') {
      twSelect.value = 'none'; // Unselect Triwulan
      if (val === 'sem1') { currentBulanAwal = 1; currentBulanAkhir = 6; }
      else if (val === 'sem2') { currentBulanAwal = 7; currentBulanAkhir = 12; }

      bAwalSelect.value = currentBulanAwal;
      bAkhirSelect.value = currentBulanAkhir;
    }
    updateFilterState();
    loadData();
  });

  // Handle Manual Month Select
  const onManualMonthChange = () => {
    currentBulanAwal = parseInt(bAwalSelect.value);
    currentBulanAkhir = parseInt(bAkhirSelect.value);
    twSelect.value = 'none';
    semSelect.value = 'none';
    updateFilterState();
    loadData();
  };
  bAwalSelect.addEventListener('change', onManualMonthChange);
  bAkhirSelect.addEventListener('change', onManualMonthChange);

  // Handle Tahun Select
  tahunSelect.addEventListener('change', (e) => {
    currentTahun = parseInt(e.target.value) || new Date().getFullYear();
    loadData();
  });

  // Reset Filter Button Handler
  btnReset.addEventListener('click', () => {
    // Preserve currentKategori so tab position does not switch
    currentTahun = 2026;
    currentBulanAwal = 1;
    currentBulanAkhir = 3;
    currentUnitId = 'all';
    currentViewMode = 'executive';

    twSelect.value = 'tw1';
    semSelect.value = 'none';
    document.getElementById('rekap-tahun-select').value = 2026;
    bAwalSelect.value = 1;
    bAkhirSelect.value = 3;
    updateFilterState();

    updateTabPillStyles();

    loadData();
  });

  // Export Excel Button Handler
  document.getElementById('btn-export-excel').addEventListener('click', async () => {
    const endpoint = `/rekap-mutu/excel?kategori=${currentKategori}&tahun=${currentTahun}&bulanAwal=${currentBulanAwal}&bulanAkhir=${currentBulanAkhir}&unitId=${currentUnitId}`;
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
    const query = `kategori=${currentKategori}&tahun=${currentTahun}&bulanAwal=${currentBulanAwal}&bulanAkhir=${currentBulanAkhir}&unitId=${currentUnitId}`;
    const res = await api.get(`/rekap-mutu?${query}`);

    if (!res.success || !res.data) {
      container.innerHTML = `
        <div class="card" style="padding: 20px; text-align: center; border: 1px solid #fde8e8; background: #fdf2f2; border-radius: 8px;">
          <div style="color: #9b1c1c; font-weight: 700; margin-bottom: 6px;">⚠️ Gagal Memuat Data Rekapitulasi</div>
          <div style="color: #771d1d; font-size: 0.8rem; margin-bottom: 12px;">Data tidak ditemukan atau terjadi masalah server.</div>
          <button id="btn-retry-load" class="btn" style="background: #9b1c1c; color: white; border: none; padding: 4px 12px; font-size: 0.78rem; border-radius: 4px; cursor: pointer;">
            🔄 Coba Lagi
          </button>
        </div>
      `;
      document.getElementById('btn-retry-load')?.addEventListener('click', loadData);
      return;
    }

    const data = res.data;

    // Dynamically update Unit Filter Options based on available category units
    const unitSelect = document.getElementById('rekap-unit-select');
    if (unitSelect && data.allCategoryUnits) {
      let opts = '<option value="all">-- Semua Unit --</option>';
      data.allCategoryUnits.forEach(u => {
        const isSel = String(u.id) === String(currentUnitId) ? 'selected' : '';
        opts += `<option value="${u.id}" ${isSel}>${u.nama_unit}</option>`;
      });
      unitSelect.innerHTML = opts;
    }

    renderMatrixTables(container, data);
  } catch (err) {
    console.error('Failed to load rekap data:', err);
    container.innerHTML = `
      <div class="card" style="padding: 20px; text-align: center; border: 1px solid #fde8e8; background: #fdf2f2; border-radius: 8px;">
        <div style="color: #9b1c1c; font-weight: 700; margin-bottom: 6px;">⚠️ Terjadi Kesalahan Koneksi</div>
        <div style="color: #771d1d; font-size: 0.8rem; margin-bottom: 12px;">Gagal terhubung ke server. Silakan periksa koneksi jaringan atau pastikan server backend sedang berjalan.</div>
        <button id="btn-retry-load" class="btn" style="background: #9b1c1c; color: white; border: none; padding: 4px 12px; font-size: 0.78rem; border-radius: 4px; cursor: pointer;">
          🔄 Coba Lagi
        </button>
      </div>
    `;
    document.getElementById('btn-retry-load')?.addEventListener('click', loadData);
  }
}

function renderMatrixTables(container, data) {
  let html = '';
  const isSem = data.isSemesterMode;
  const semLabel = data.semesterLabel || 'TOTAL SEMESTER';

  // Render View Switcher Banner if in Semester Mode
  if (isSem) {
    html += `
      <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: #fef3c7; padding: 8px 14px; border-radius: 8px; border: 1px solid #fde68a;">
        <div style="font-size: 0.8rem; color: #78350f; font-weight: 600; display: flex; align-items: center; gap: 6px;">
          <span>📙 Mode Laporan: <strong>${semLabel} (${data.tahun})</strong></span>
          <span style="font-weight: 500; font-size: 0.73rem; color: #92400e;">(Agregasi Triwulan & Total Semester)</span>
        </div>

        <div style="display: flex; gap: 6px;">
          <button id="toggle-view-exec" class="btn" style="padding: 3px 10px; border-radius: 5px; font-size: 0.75rem; font-weight: 700; cursor: pointer; ${currentViewMode === 'executive' ? 'background: #b45309; color: white; border: none;' : 'background: #ffffff; color: #78350f; border: 1px solid #fcd34d;'}">
            📊 Ringkasan Eksekutif (Triwulan & Semester)
          </button>
          <button id="toggle-view-detail" class="btn" style="padding: 3px 10px; border-radius: 5px; font-size: 0.75rem; font-weight: 700; cursor: pointer; ${currentViewMode === 'detail' ? 'background: #b45309; color: white; border: none;' : 'background: #ffffff; color: #78350f; border: 1px solid #fcd34d;'}">
            🔍 Detil Rincian Bulanan (Full 6 Bulan)
          </button>
        </div>
      </div>
    `;
  }

  // Legend guide
  const legendHTML = `
    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.75rem; color: #475569;">
      <div>
        <strong>💡 Keterangan Kolom:</strong>
        <span style="margin-left: 6px; color: #1e293b;"><strong>N</strong> = Numerator</span> |
        <span style="margin-left: 4px; color: #1e293b;"><strong>D</strong> = Denumerator</span> |
        <span style="margin-left: 4px; color: #2563eb; font-weight: 700;"><strong>C</strong> = Capaian (%)</span>
        ${isSem ? `| <span style="margin-left: 6px; color: #78350f; font-weight: 700;"><strong>${semLabel}</strong> = Agregasi Semester</span>` : ''}
      </div>
      <div style="color: #64748b; font-size: 0.72rem;">
        *Kolom paling kanan menampilkan agregasi total
      </div>
    </div>
  `;

  html += legendHTML;

  // Render Empty State if no data exists for this category/unit filter
  const isCategoryEmpty = data.kategori === 'inm'
    ? (!data.totalRs || data.totalRs.length === 0)
    : (!data.rooms || data.rooms.length === 0);

  if (isCategoryEmpty) {
    const categoryLabels = {
      inm: '🇮🇩 Indikator Nasional Mutu (INM)',
      rawat_inap: 'Rawat Inap (Umum)',
      unit_khusus: 'Unit Khusus & Intensif',
      igd: 'IGD (Gawat Darurat)',
      rawat_jalan: 'Rawat Jalan',
      farmasi: 'Farmasi',
      penunjang: 'Penunjang Medis & Non-Medis'
    };
    const catName = categoryLabels[data.kategori] || data.kategori;

    html += `
      <div class="card" style="padding: 24px 20px; text-align: center; border: 1px solid #bae6fd; background: #f0f9ff; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 2rem; margin-bottom: 8px;">📋</div>
        <div style="color: #0369a1; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">
          Belum Ada Data Indikator Terdaftar untuk Kategori ${catName}
        </div>
        <div style="color: #0c4a6e; font-size: 0.8rem; max-width: 620px; margin: 0 auto 12px; line-height: 1.4;">
          Unit dalam kategori ini belum memiliki entri indikator mutu pada periode yang dipilih, atau modul transaksi indikator spesifik unit sedang dalam tahap pengumpulan data.
        </div>
        <div style="display: inline-flex; gap: 8px; justify-content: center;">
          <a href="#/admin/units" class="btn" style="background: #0284c7; color: white; border: none; padding: 4px 12px; font-size: 0.76rem; border-radius: 5px; text-decoration: none; font-weight: 600;">
            ⚙️ Kelola Master Unit
          </a>
        </div>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  // 1. Render Room Tables (Excluded for INM category as only TOTAL CAPAIAN INM is required)
  if (data.kategori !== 'inm' && data.rooms && data.rooms.length > 0) {
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

                  ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                    const pal = getMonthPalette(b.bulan);
                    return `
                      <th colspan="3" style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; background: ${pal.headerBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">
                        ${b.nama}
                      </th>
                    `;
                  }).join('') : ''}

                  ${isSem ? `
                    <th colspan="3" style="text-align: center; border-right: 1px solid #334155; border-bottom: 1px solid #334155; background: #1e293b; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                      ${data.bulanAwal === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III'}
                    </th>
                    <th colspan="3" style="text-align: center; border-right: 1px solid #334155; border-bottom: 1px solid #334155; background: #1e293b; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                      ${data.bulanAwal === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV'}
                    </th>
                    <th colspan="3" style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; background: #78350f; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                      ${semLabel}
                    </th>
                  ` : `
                    <th colspan="3" style="text-align: center; border-right: 1px solid #0f172a; border-bottom: 1px solid #0f172a; background: #0f172a; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                      ${data.triwulanLabel}
                    </th>
                  `}
                </tr>
                <tr style="background: #f8fafc;">
                  ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                    const pal = getMonthPalette(b.bulan);
                    return `
                      <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 52px; min-width: 52px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 4px 2px;">N</th>
                      <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 52px; min-width: 52px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 4px 2px;">D</th>
                      <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 58px; min-width: 58px; font-size: 0.7rem; background: ${pal.capBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">C</th>
                    `;
                  }).join('') : ''}

                  ${isSem ? `
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 55px; min-width: 55px; font-size: 0.7rem; background: #334155; color: #ffffff; padding: 4px 2px;">Tot N</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 55px; min-width: 55px; font-size: 0.7rem; background: #334155; color: #ffffff; padding: 4px 2px;">Tot D</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 55px; min-width: 55px; font-size: 0.7rem; background: #334155; color: #ffffff; padding: 4px 2px;">Tot N</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 55px; min-width: 55px; font-size: 0.7rem; background: #334155; color: #ffffff; padding: 4px 2px;">Tot D</th>
                    <th style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                    <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 55px; min-width: 55px; font-size: 0.7rem; background: #92400e; color: #ffffff; padding: 4px 2px;">Tot N</th>
                    <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 55px; min-width: 55px; font-size: 0.7rem; background: #92400e; color: #ffffff; padding: 4px 2px;">Tot D</th>
                    <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 60px; min-width: 60px; font-size: 0.7rem; background: #78350f; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                  ` : `
                    <th style="text-align: center; border-right: 1px solid #334155; border-bottom: 1px solid #334155; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e293b; color: #ffffff; padding: 4px 2px;">Tot N</th>
                    <th style="text-align: center; border-right: 1px solid #334155; border-bottom: 1px solid #334155; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e293b; color: #ffffff; padding: 4px 2px;">Tot D</th>
                    <th style="text-align: center; border-right: 1px solid #0f172a; border-bottom: 1px solid #0f172a; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                  `}
                </tr>
              </thead>
              <tbody>
                ${room.indicators.map((ind, idx) => {
                  const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const tot = ind.totalPeriode || { numerator: 0, denominator: 0, capaian: 0 };
                  const sb = ind.semesterBreakdown;
                  return `
                    <tr style="background: ${rowBg};">
                      <td style="position: sticky; left: 0; z-index: 5; background: ${rowBg}; text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; padding: 3px;">${ind.no}</td>
                      <td style="position: sticky; left: 28px; z-index: 5; background: ${rowBg}; border-right: 2px solid #94a3b8; border-bottom: 1px solid #e2e8f0; padding: 4px 8px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">
                        <div style="font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: normal;">${ind.nama_modul}</div>
                        <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">Standar: ${ind.standar}</div>
                      </td>

                      ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                        const pal = getMonthPalette(b.bulan);
                        const mData = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
                        const numVal = mData.numerator !== null && mData.numerator !== undefined ? mData.numerator : '-';
                        const denVal = mData.denominator !== null && mData.denominator !== undefined ? mData.denominator : '-';
                        return `
                          <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; color: #334155; white-space: nowrap;">${numVal}</td>
                          <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; color: #334155; white-space: nowrap;">${denVal}</td>
                          <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: ${pal.textColor}; background: ${pal.capCellBg}; white-space: nowrap;">
                            ${mData.capaian}
                          </td>
                        `;
                      }).join('') : ''}

                      ${isSem && sb ? `
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${sb.tw1.numerator !== null && sb.tw1.numerator !== undefined ? sb.tw1.numerator : '-'}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${sb.tw1.denominator}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e3a8a;">${sb.tw1.capaian}</td>

                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${sb.tw2.numerator !== null && sb.tw2.numerator !== undefined ? sb.tw2.numerator : '-'}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${sb.tw2.denominator}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e3a8a;">${sb.tw2.capaian}</td>

                        <td style="text-align: center; border-right: 1px solid #fde68a; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #78350f; background: #fef3c7;">${sb.totalSemester.numerator !== null && sb.totalSemester.numerator !== undefined ? sb.totalSemester.numerator : '-'}</td>
                        <td style="text-align: center; border-right: 1px solid #fde68a; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #78350f; background: #fef3c7;">${sb.totalSemester.denominator}</td>
                        <td style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #78350f;">${sb.totalSemester.capaian}</td>
                      ` : `
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${tot.numerator !== null && tot.numerator !== undefined ? tot.numerator : '-'}</td>
                        <td style="text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #0f172a; background: #f1f5f9;">${tot.denominator}</td>
                        <td style="text-align: center; border-right: 1px solid #0f172a; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e3a8a;">${tot.capaian}</td>
                      `}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
  }

  // 2. Render Aggregated TOTAL MUTU RS Table (for rawat_inap & inm categories)
  if ((data.kategori === 'rawat_inap' || data.kategori === 'inm') && data.totalRs && data.totalRs.length > 0) {
    const isInm = data.kategori === 'inm';
    const totalTitle = isInm ? 'TOTAL CAPAIAN INM RUMAH SAKIT ISLAM KARAWANG' : 'TOTAL CAPAIAN MUTU RUMAH SAKIT';
    html += `
      <div class="card" style="margin-bottom: 20px; padding: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 2px solid ${isInm ? '#059669' : '#2563eb'};">
        <div style="background: ${isInm ? '#047857' : '#1e40af'}; color: white; padding: 8px 14px; font-weight: 700; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center;">
          <span>${totalTitle}</span>
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

                ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                  const pal = getMonthPalette(b.bulan);
                  return `
                    <th colspan="3" style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; background: ${pal.headerBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">
                      MUTU RS ${b.nama}
                    </th>
                  `;
                }).join('') : ''}

                ${isSem ? `
                  <th colspan="3" style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                    ${data.bulanAwal === 1 ? 'TRIWULAN I RS' : 'TRIWULAN III RS'}
                  </th>
                  <th colspan="3" style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                    ${data.bulanAwal === 1 ? 'TRIWULAN II RS' : 'TRIWULAN IV RS'}
                  </th>
                  <th colspan="3" style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; background: #78350f; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                    ${semLabel} RS
                  </th>
                ` : `
                  <th colspan="3" style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">
                    ${data.triwulanLabel} RS
                  </th>
                `}
              </tr>
              <tr style="background: #f0f9ff;">
                ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                  const pal = getMonthPalette(b.bulan);
                  return `
                    <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 52px; min-width: 52px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 4px 2px;">Tot N</th>
                    <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 52px; min-width: 52px; font-size: 0.7rem; background: ${pal.subBg}; color: ${pal.textColor}; padding: 4px 2px;">Tot D</th>
                    <th style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; width: 58px; min-width: 58px; font-size: 0.7rem; background: ${pal.capBg}; color: ${pal.textColor}; font-weight: 700; padding: 4px 2px;">C</th>
                  `;
                }).join('') : ''}

                ${isSem ? `
                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot N</th>
                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot D</th>
                  <th style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>

                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot N</th>
                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot D</th>
                  <th style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>

                  <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 55px; min-width: 55px; font-size: 0.7rem; background: #92400e; color: #ffffff; padding: 4px 2px;">Tot N</th>
                  <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 55px; min-width: 55px; font-size: 0.7rem; background: #92400e; color: #ffffff; padding: 4px 2px;">Tot D</th>
                  <th style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; width: 60px; min-width: 60px; font-size: 0.7rem; background: #78350f; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                ` : `
                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot N</th>
                  <th style="text-align: center; border-right: 1px solid #1d4ed8; border-bottom: 1px solid #1d4ed8; width: 55px; min-width: 55px; font-size: 0.7rem; background: #1e3a8a; color: #ffffff; padding: 4px 2px;">Tot D</th>
                  <th style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #1e40af; width: 60px; min-width: 60px; font-size: 0.7rem; background: #1e40af; color: #ffffff; font-weight: 700; padding: 4px 2px;">C</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${data.totalRs.map((ind, idx) => {
                const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                const tot = ind.totalPeriode || { numerator: 0, denominator: 0, capaian: 0 };
                const sb = ind.semesterBreakdown;
                return `
                  <tr style="background: ${rowBg};">
                    <td style="position: sticky; left: 0; z-index: 5; background: ${rowBg}; text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; padding: 3px;">${ind.no}</td>
                    <td style="position: sticky; left: 28px; z-index: 5; background: ${rowBg}; border-right: 2px solid #3b82f6; border-bottom: 1px solid #e2e8f0; padding: 4px 8px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.12);">
                      <div style="font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: normal;">${ind.nama_modul}</div>
                      <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">Standar: ${ind.standar}</div>
                    </td>

                    ${(!isSem || currentViewMode === 'detail') ? data.bulanList.map(b => {
                      const pal = getMonthPalette(b.bulan);
                      const mData = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
                      const numVal = mData.numerator !== null && mData.numerator !== undefined ? mData.numerator : '-';
                      const denVal = mData.denominator !== null && mData.denominator !== undefined ? mData.denominator : '-';
                      return `
                        <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 600; color: #334155; white-space: nowrap;">${numVal}</td>
                        <td style="text-align: center; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 600; color: #334155; white-space: nowrap;">${denVal}</td>
                        <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: ${pal.textColor}; background: ${pal.capCellBg}; white-space: nowrap;">
                          ${mData.capaian}
                        </td>
                      `;
                    }).join('') : ''}

                    ${isSem && sb ? `
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${sb.tw1.numerator !== null && sb.tw1.numerator !== undefined ? sb.tw1.numerator : '-'}</td>
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${sb.tw1.denominator}</td>
                      <td style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e40af;">${sb.tw1.capaian}</td>

                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${sb.tw2.numerator !== null && sb.tw2.numerator !== undefined ? sb.tw2.numerator : '-'}</td>
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${sb.tw2.denominator}</td>
                      <td style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e40af;">${sb.tw2.capaian}</td>

                      <td style="text-align: center; border-right: 1px solid #fde68a; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #78350f; background: #fef3c7;">${sb.totalSemester.numerator !== null && sb.totalSemester.numerator !== undefined ? sb.totalSemester.numerator : '-'}</td>
                      <td style="text-align: center; border-right: 1px solid #fde68a; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #78350f; background: #fef3c7;">${sb.totalSemester.denominator}</td>
                      <td style="text-align: center; border-right: 1px solid #78350f; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #78350f;">${sb.totalSemester.capaian}</td>
                    ` : `
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${tot.numerator !== null && tot.numerator !== undefined ? tot.numerator : '-'}</td>
                      <td style="text-align: center; border-right: 1px solid #bfdbfe; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">${tot.denominator}</td>
                      <td style="text-align: center; border-right: 1px solid #1e40af; border-bottom: 1px solid #e2e8f0; padding: 4px 6px; font-weight: 800; color: #ffffff; background: #1e40af;">${tot.capaian}</td>
                    `}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Attach event listeners for view switcher if in Semester Mode
  if (isSem) {
    const btnExec = document.getElementById('toggle-view-exec');
    const btnDetail = document.getElementById('toggle-view-detail');

    if (btnExec && btnDetail) {
      btnExec.addEventListener('click', () => {
        if (currentViewMode !== 'executive') {
          currentViewMode = 'executive';
          renderMatrixTables(container, data);
        }
      });

      btnDetail.addEventListener('click', () => {
        if (currentViewMode !== 'detail') {
          currentViewMode = 'detail';
          renderMatrixTables(container, data);
        }
      });
    }
  }
}
