import { api } from '../../api/client.js';
import { showToast } from '../../components/toast.js';

let state = {
  units: [],
  selectedUnitId: null,
  selectedUnit: null,
  indicators: [],
  searchQuery: '',
  filterStatus: 'all' // 'all', 'active', 'inactive'
};

export async function render(container) {
  container.innerHTML = `
    <div style="max-width: 1100px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- Header Banner (Compact) -->
      <div class="card" style="margin-bottom: 12px; padding: 10px 16px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="margin: 0 0 2px 0; font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ⚙️ Kelola Indikator Mutu Unit
            </h2>
            <div style="font-size: 0.75rem; color: #94a3b8;">
              Atur dan batasi indikator mutu apa saja yang aktif dan di-input oleh masing-masing unit/ruangan.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <a href="#/admin/units" class="btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 0.72rem; padding: 4px 10px; border-radius: 5px; text-decoration: none;">
              🏥 Master Unit
            </a>
            <a href="#/rekap-mutu" class="btn" style="background: #3b82f6; color: white; border: none; font-size: 0.72rem; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-weight: 600;">
              📊 Rekap Mutu
            </a>
          </div>
        </div>
      </div>

      <!-- Unit Selector Card (Compact) -->
      <div class="card" style="margin-bottom: 12px; padding: 10px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <label style="font-weight: 700; font-size: 0.82rem; color: #1e293b; white-space: nowrap;">
            🏥 Pilih Unit / Ruangan:
          </label>

          <select id="select-unit-target" class="form-control" style="max-width: 320px; font-weight: 600; font-size: 0.82rem; height: 34px; padding: 2px 10px; border: 1px solid #94a3b8; border-radius: 6px;">
            <option value="">-- Memuat daftar unit... --</option>
          </select>

          <div id="unit-badge-container" style="display: inline-flex; align-items: center; gap: 6px;">
            <!-- Badge Kategori Unit will render here -->
          </div>
        </div>
      </div>

      <!-- Main Config Container -->
      <div id="config-content-area">
        <div class="card" style="padding: 30px; text-align: center; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div class="spinner" style="margin-bottom: 8px;"></div>
          Memuat data unit dan indikator...
        </div>
      </div>
    </div>
  `;

  await loadUnits();
}

async function loadUnits() {
  try {
    const res = await api.get('/units?all=true');
    if (res.success && res.data) {
      state.units = res.data.filter(u => u.aktif);
      renderUnitSelectOptions();

      if (state.units.length > 0) {
        state.selectedUnitId = state.units[0].id;
        document.getElementById('select-unit-target').value = state.selectedUnitId;
        await loadUnitConfigs(state.selectedUnitId);
      }
    }
  } catch (err) {
    console.error('Gagal memuat daftar unit:', err);
    showToast('Gagal memuat daftar unit', 'error');
  }

  document.getElementById('select-unit-target')?.addEventListener('change', async (e) => {
    state.selectedUnitId = e.target.value;
    if (state.selectedUnitId) {
      await loadUnitConfigs(state.selectedUnitId);
    }
  });
}

function renderUnitSelectOptions() {
  const select = document.getElementById('select-unit-target');
  if (!select) return;

  const categories = {
    rawat_inap: '🛏️ Rawat Inap (Umum)',
    unit_khusus: '🏥 Unit Khusus & Intensif',
    igd: '🚨 IGD (Gawat Darurat)',
    rawat_jalan: '🚶 Rawat Jalan',
    farmasi: '💊 Farmasi',
    penunjang: '🛠️ Penunjang Medis & Non-Medis'
  };

  const grouped = {};
  state.units.forEach(u => {
    const cat = u.kategori_unit || 'rawat_inap';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(u);
  });

  let opts = '';
  Object.keys(categories).forEach(catKey => {
    if (grouped[catKey] && grouped[catKey].length > 0) {
      opts += `<optgroup label="${categories[catKey]}">`;
      grouped[catKey].forEach(u => {
        opts += `<option value="${u.id}">${u.nama_unit} (${u.kode_unit})</option>`;
      });
      opts += `</optgroup>`;
    }
  });

  select.innerHTML = opts;
}

async function loadUnitConfigs(unitId) {
  const contentArea = document.getElementById('config-content-area');
  const badgeContainer = document.getElementById('unit-badge-container');
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="card" style="padding: 24px; text-align: center; color: #64748b;">
      <div class="spinner" style="margin-bottom: 6px;"></div>
      Sedang mengambil konfigurasi indikator unit...
    </div>
  `;

  try {
    const res = await api.get(`/unit-indicator-configs?unitId=${unitId}`);
    if (res.success && res.data) {
      state.selectedUnit = res.data.unit;
      state.indicators = res.data.indicators;
      state.searchQuery = '';
      state.filterStatus = 'all';

      // Render category badge
      if (badgeContainer && state.selectedUnit) {
        const cat = (state.selectedUnit.kategori_unit || 'rawat_inap').toLowerCase();
        let catBadge = '<span class="badge" style="background:#dbeafe; color:#1e40af; font-size:0.75rem; padding:3px 8px;">🛏️ Rawat Inap</span>';
        if (cat === 'unit_khusus') catBadge = '<span class="badge" style="background:#fce7f3; color:#9d174d; font-size:0.75rem; padding:3px 8px;">🏥 Unit Khusus</span>';
        if (cat === 'igd') catBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; font-size:0.75rem; padding:3px 8px;">🚨 IGD</span>';
        if (cat === 'rawat_jalan') catBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.75rem; padding:3px 8px;">🚶 Rawat Jalan</span>';
        if (cat === 'farmasi') catBadge = '<span class="badge" style="background:#f3e8ff; color:#6b21a8; font-size:0.75rem; padding:3px 8px;">💊 Farmasi</span>';
        if (cat === 'penunjang') catBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; font-size:0.75rem; padding:3px 8px;">🛠️ Penunjang</span>';
        badgeContainer.innerHTML = catBadge;
      }

      renderConfigForm(contentArea);
    }
  } catch (err) {
    console.error('Error loading unit configs:', err);
    contentArea.innerHTML = `
      <div class="card" style="padding: 16px; text-align: center; background: #fdf2f2; border: 1px solid #fca5a5; color: #991b1b; border-radius: 8px; font-size: 0.82rem;">
        ⚠️ Gagal mengambil konfigurasi indikator untuk unit ini.
      </div>
    `;
  }
}

function renderConfigForm(container) {
  let html = `
    <div class="card" style="padding: 12px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      
      <!-- Compact Action & Search Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        
        <!-- Search Input & Counter -->
        <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 260px;">
          <div style="position: relative; flex: 1; max-width: 320px;">
            <input type="text" id="search-indicator" placeholder="Cari nama / ID indikator..." value="${state.searchQuery}" style="width: 100%; height: 32px; font-size: 0.78rem; padding: 2px 10px 2px 28px; border: 1px solid #cbd5e1; border-radius: 5px; background: #f8fafc;">
            <span style="position: absolute; left: 8px; top: 6px; font-size: 0.8rem; color: #94a3b8;">🔍</span>
          </div>

          <span id="active-counter-badge" style="color: #1e40af; font-weight: 700; font-size: 0.75rem; background: #eff6ff; padding: 3px 8px; border-radius: 5px; border: 1px solid #bfdbfe; white-space: nowrap;">
            <!-- Counter will update dynamically -->
          </span>
        </div>

        <!-- Filter Status & Quick Selection -->
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <div style="display: inline-flex; border-radius: 5px; overflow: hidden; border: 1px solid #cbd5e1; background: #f1f5f9;">
            <button class="filter-status-btn ${state.filterStatus === 'all' ? 'active' : ''}" data-status="all" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 600; border: none; cursor: pointer; background: ${state.filterStatus === 'all' ? '#2563eb' : 'transparent'}; color: ${state.filterStatus === 'all' ? '#ffffff' : '#475569'};">Semua</button>
            <button class="filter-status-btn ${state.filterStatus === 'active' ? 'active' : ''}" data-status="active" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 600; border: none; cursor: pointer; background: ${state.filterStatus === 'active' ? '#16a34a' : 'transparent'}; color: ${state.filterStatus === 'active' ? '#ffffff' : '#475569'};">Aktif</button>
            <button class="filter-status-btn ${state.filterStatus === 'inactive' ? 'active' : ''}" data-status="inactive" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 600; border: none; cursor: pointer; background: ${state.filterStatus === 'inactive' ? '#dc2626' : 'transparent'}; color: ${state.filterStatus === 'inactive' ? '#ffffff' : '#475569'};">Non-Aktif</button>
          </div>

          <div style="width: 1px; height: 18px; background: #cbd5e1; margin: 0 2px;"></div>

          <button id="btn-select-all" class="btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 5px; font-weight: 600; font-size: 0.72rem; cursor: pointer;">
            ✅ Pilih Semua
          </button>
          <button id="btn-deselect-all" class="btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 5px; font-weight: 600; font-size: 0.72rem; cursor: pointer;">
            ❌ Matikan Semua
          </button>
        </div>
      </div>

      <!-- Compact Indicator Grid Container -->
      <div id="compact-grid-wrapper" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 8px; margin-bottom: 14px;">
        <!-- Grid items will be rendered dynamically -->
      </div>

      <!-- Sticky Save Action Bar (Compact) -->
      <div style="position: sticky; bottom: 8px; background: #ffffff; padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; z-index: 50;">
        <div style="font-size: 0.75rem; color: #475569;">
          💡 Perubahan langsung berlaku pada Rekap Data Mutu unit <strong>${state.selectedUnit ? state.selectedUnit.nama_unit : ''}</strong>.
        </div>

        <button id="btn-save-unit-config" class="btn" style="background: #2563eb; color: white; border: none; padding: 6px 18px; border-radius: 5px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
          💾 Simpan Konfigurasi Unit
        </button>
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Initial render of grid items
  renderGridItems();

  // Attach search input listener
  const searchInput = document.getElementById('search-indicator');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderGridItems();
    });
  }

  // Attach filter status listeners
  container.querySelectorAll('.filter-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.filterStatus = e.target.getAttribute('data-status');
      
      container.querySelectorAll('.filter-status-btn').forEach(b => {
        const status = b.getAttribute('data-status');
        let bg = 'transparent';
        let col = '#475569';
        if (status === state.filterStatus) {
          bg = status === 'active' ? '#16a34a' : status === 'inactive' ? '#dc2626' : '#2563eb';
          col = '#ffffff';
        }
        b.style.background = bg;
        b.style.color = col;
      });

      renderGridItems();
    });
  });

  // Select All
  document.getElementById('btn-select-all')?.addEventListener('click', () => {
    state.indicators.forEach(i => i.aktif = true);
    renderGridItems();
  });

  // Deselect All
  document.getElementById('btn-deselect-all')?.addEventListener('click', () => {
    state.indicators.forEach(i => i.aktif = false);
    renderGridItems();
  });

  // Save Button
  document.getElementById('btn-save-unit-config')?.addEventListener('click', saveConfig);
}

function renderGridItems() {
  const gridWrapper = document.getElementById('compact-grid-wrapper');
  const counterBadge = document.getElementById('active-counter-badge');
  if (!gridWrapper) return;

  const totalCount = state.indicators.length;
  const activeCount = state.indicators.filter(i => i.aktif).length;

  // Filter indicators based on search query and status filter
  const filtered = state.indicators.filter(ind => {
    const matchSearch = !state.searchQuery || 
      ind.nama.toLowerCase().includes(state.searchQuery) || 
      ind.id.toLowerCase().includes(state.searchQuery);
    
    let matchStatus = true;
    if (state.filterStatus === 'active') matchStatus = ind.aktif;
    if (state.filterStatus === 'inactive') matchStatus = !ind.aktif;

    return matchSearch && matchStatus;
  });

  if (counterBadge) {
    counterBadge.textContent = `${activeCount} / ${totalCount} Aktif`;
  }

  if (filtered.length === 0) {
    gridWrapper.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #94a3b8; font-size: 0.8rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
        🔍 Tidak ada indikator yang sesuai dengan pencarian / filter.
      </div>
    `;
    return;
  }

  let itemsHtml = '';
  filtered.forEach((ind) => {
    // Find original index for numbering display
    const origIdx = state.indicators.findIndex(i => i.id === ind.id);
    const isChecked = ind.aktif ? 'checked' : '';
    const itemBg = ind.aktif ? '#f0f7ff' : '#f8fafc';
    const borderColor = ind.aktif ? '#93c5fd' : '#e2e8f0';

    itemsHtml += `
      <label class="compact-indicator-card" style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: ${itemBg}; border: 1px solid ${borderColor}; border-radius: 6px; cursor: pointer; transition: all 0.12s ease; user-select: none;">
        
        <input type="checkbox" class="chk-indicator" data-id="${ind.id}" ${isChecked} style="width: 15px; height: 15px; margin: 0; accent-color: #2563eb; cursor: pointer; flex-shrink: 0;">
        
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
            <span style="font-weight: 600; font-size: 0.78rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ind.nama}">
              ${origIdx + 1}. ${ind.nama}
            </span>
            <span style="font-size: 0.64rem; font-weight: 700; background: #ffffff; color: #1d4ed8; padding: 1px 5px; border-radius: 4px; border: 1px solid #bfdbfe; white-space: nowrap; flex-shrink: 0;">
              ${ind.standar}
            </span>
          </div>

          <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px; font-family: monospace;">
            ID: <span style="color: #334155;">${ind.id}</span>
          </div>
        </div>
      </label>
    `;
  });

  gridWrapper.innerHTML = itemsHtml;

  // Re-attach checkbox event listeners
  gridWrapper.querySelectorAll('.chk-indicator').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const indId = e.target.getAttribute('data-id');
      const indObj = state.indicators.find(i => i.id === indId);
      if (indObj) {
        indObj.aktif = e.target.checked;
      }
      
      // Update item background dynamically without re-rendering grid
      const parentCard = e.target.closest('.compact-indicator-card');
      if (parentCard) {
        parentCard.style.background = e.target.checked ? '#f0f7ff' : '#f8fafc';
        parentCard.style.borderColor = e.target.checked ? '#93c5fd' : '#e2e8f0';
      }

      // Update counter
      const newActiveCount = state.indicators.filter(i => i.aktif).length;
      if (counterBadge) {
        counterBadge.textContent = `${newActiveCount} / ${totalCount} Aktif`;
      }
    });
  });
}

async function saveConfig() {
  if (!state.selectedUnitId) return;

  const btn = document.getElementById('btn-save-unit-config');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⌛ Menyimpan...';
  }

  try {
    const activeIds = state.indicators.filter(i => i.aktif).map(i => i.id);

    const res = await api.post('/unit-indicator-configs', {
      unitId: state.selectedUnitId,
      activeIndicatorIds: activeIds
    });

    if (res.success) {
      showToast(`Konfigurasi unit ${state.selectedUnit ? state.selectedUnit.nama_unit : ''} berhasil disimpan!`, 'success');
    } else {
      showToast(res.message || 'Gagal menyimpan konfigurasi', 'error');
    }
  } catch (err) {
    console.error('Failed to save configs:', err);
    showToast('Gagal menyimpan konfigurasi unit', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '💾 Simpan Konfigurasi Unit';
    }
  }
}
