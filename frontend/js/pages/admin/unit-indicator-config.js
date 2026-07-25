import { api } from '../../api/client.js';
import { showToast } from '../../components/toast.js';

let state = {
  units: [],
  selectedUnitId: null,
  selectedUnit: null,
  indicators: []
};

export async function render(container) {
  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- Header Banner -->
      <div class="card" style="margin-bottom: 16px; padding: 14px 18px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="margin: 0 0 4px 0; font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              ⚙️ Kelola Indikator Mutu Unit
            </h2>
            <div style="font-size: 0.78rem; color: #94a3b8;">
              Atur dan batasi indikator mutu apa saja yang aktif dan di-input oleh masing-masing unit/ruangan.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <a href="#admin-units" class="btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 0.75rem; padding: 4px 10px; border-radius: 5px; text-decoration: none;">
              🏥 Data Master Unit
            </a>
            <a href="#rekap-mutu" class="btn" style="background: #3b82f6; color: white; border: none; font-size: 0.75rem; padding: 4px 12px; border-radius: 5px; text-decoration: none; font-weight: 600;">
              📊 Lihat Rekap Mutu
            </a>
          </div>
        </div>
      </div>

      <!-- Unit Selector Card -->
      <div class="card" style="margin-bottom: 16px; padding: 14px 18px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <label style="font-weight: 700; font-size: 0.85rem; color: #1e293b; white-space: nowrap;">
            🏥 Pilih Unit / Ruangan:
          </label>

          <select id="select-unit-target" class="form-control" style="max-width: 320px; font-weight: 600; font-size: 0.85rem; height: 36px; border: 1px solid #94a3b8; border-radius: 6px;">
            <option value="">-- Memuat daftar unit... --</option>
          </select>

          <div id="unit-badge-container" style="display: inline-flex; align-items: center; gap: 6px;">
            <!-- Badge Kategori Unit will render here -->
          </div>
        </div>
      </div>

      <!-- Main Config Container -->
      <div id="config-content-area">
        <div class="card" style="padding: 40px; text-align: center; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div class="spinner" style="margin-bottom: 10px;"></div>
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
    <div class="card" style="padding: 30px; text-align: center; color: #64748b;">
      <div class="spinner" style="margin-bottom: 8px;"></div>
      Sedang mengambil konfigurasi indikator unit...
    </div>
  `;

  try {
    const res = await api.get(`/unit-indicator-configs?unitId=${unitId}`);
    if (res.success && res.data) {
      state.selectedUnit = res.data.unit;
      state.indicators = res.data.indicators;

      // Render category badge
      if (badgeContainer && state.selectedUnit) {
        const cat = (state.selectedUnit.kategori_unit || 'rawat_inap').toLowerCase();
        let catBadge = '<span class="badge" style="background:#dbeafe; color:#1e40af;">🛏️ Rawat Inap</span>';
        if (cat === 'unit_khusus') catBadge = '<span class="badge" style="background:#fce7f3; color:#9d174d;">🏥 Unit Khusus</span>';
        if (cat === 'igd') catBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b;">🚨 IGD</span>';
        if (cat === 'rawat_jalan') catBadge = '<span class="badge" style="background:#fef3c7; color:#92400e;">🚶 Rawat Jalan</span>';
        if (cat === 'farmasi') catBadge = '<span class="badge" style="background:#f3e8ff; color:#6b21a8;">💊 Farmasi</span>';
        if (cat === 'penunjang') catBadge = '<span class="badge" style="background:#f1f5f9; color:#475569;">🛠️ Penunjang</span>';
        badgeContainer.innerHTML = catBadge;
      }

      renderConfigForm(contentArea);
    }
  } catch (err) {
    console.error('Error loading unit configs:', err);
    contentArea.innerHTML = `
      <div class="card" style="padding: 20px; text-align: center; background: #fdf2f2; border: 1px solid #fca5a5; color: #991b1b; border-radius: 8px;">
        ⚠️ Gagal mengambil konfigurasi indikator untuk unit ini.
      </div>
    `;
  }
}

function renderConfigForm(container) {
  const activeCount = state.indicators.filter(i => i.aktif).length;
  const totalCount = state.indicators.length;

  let html = `
    <div class="card" style="padding: 16px 20px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
      
      <!-- Action Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
        <div style="font-size: 0.85rem; color: #334155; font-weight: 600;">
          Daftar Indikator Mutu: 
          <span id="active-counter-text" style="color: #2563eb; font-weight: 700; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
            ${activeCount} dari ${totalCount} Aktif
          </span>
        </div>

        <div style="display: flex; gap: 6px;">
          <button id="btn-select-all" class="btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 5px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
            ✅ Pilih Semua
          </button>
          <button id="btn-deselect-all" class="btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 5px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
            ❌ Matikan Semua
          </button>
        </div>
      </div>

      <!-- Checklist Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 12px; margin-bottom: 20px;">
  `;

  state.indicators.forEach((ind, idx) => {
    const isChecked = ind.aktif ? 'checked' : '';
    const cardBg = ind.aktif ? '#ffffff' : '#f8fafc';
    const borderColor = ind.aktif ? '#3b82f6' : '#e2e8f0';

    html += `
      <label class="indicator-item-card" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: ${cardBg}; border: 1.5px solid ${borderColor}; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; user-select: none;">
        
        <input type="checkbox" class="chk-indicator" data-id="${ind.id}" ${isChecked} style="width: 18px; height: 18px; margin-top: 2px; accent-color: #2563eb; cursor: pointer;">
        
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">
              ${idx + 1}. ${ind.nama}
            </span>
            <span style="font-size: 0.68rem; font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 1px 6px; border-radius: 4px; border: 1px solid #bfdbfe; white-space: nowrap;">
              Target: ${ind.standar}
            </span>
          </div>

          <div style="font-size: 0.72rem; color: #64748b;">
            Kode ID: <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #334155;">${ind.id}</code>
          </div>
        </div>
      </label>
    `;
  });

  html += `
      </div>

      <!-- Bottom Save Action Bar -->
      <div style="position: sticky; bottom: 12px; background: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; z-index: 50;">
        <div style="font-size: 0.78rem; color: #64748b;">
          💡 Perubahan akan langsung berdampak pada tampilan Rekap Data Mutu & Excel Unit <strong>${state.selectedUnit ? state.selectedUnit.nama_unit : ''}</strong>.
        </div>

        <button id="btn-save-unit-config" class="btn" style="background: #2563eb; color: white; border: none; padding: 8px 24px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(37,99,235,0.3);">
          💾 Simpan Konfigurasi Unit
        </button>
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Event Listeners for Checkboxes
  container.querySelectorAll('.chk-indicator').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const indId = e.target.getAttribute('data-id');
      const indObj = state.indicators.find(i => i.id === indId);
      if (indObj) {
        indObj.aktif = e.target.checked;
      }
      updateActiveCounter();
    });
  });

  // Select All
  document.getElementById('btn-select-all')?.addEventListener('click', () => {
    state.indicators.forEach(i => i.aktif = true);
    container.querySelectorAll('.chk-indicator').forEach(c => c.checked = true);
    updateActiveCounter();
  });

  // Deselect All
  document.getElementById('btn-deselect-all')?.addEventListener('click', () => {
    state.indicators.forEach(i => i.aktif = false);
    container.querySelectorAll('.chk-indicator').forEach(c => c.checked = false);
    updateActiveCounter();
  });

  // Save Button
  document.getElementById('btn-save-unit-config')?.addEventListener('click', saveConfig);
}

function updateActiveCounter() {
  const activeCount = state.indicators.filter(i => i.aktif).length;
  const totalCount = state.indicators.length;
  const counterEl = document.getElementById('active-counter-text');
  if (counterEl) {
    counterEl.textContent = `${activeCount} dari ${totalCount} Aktif`;
  }
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
      showToast(`Konfigurasi indikator unit ${state.selectedUnit ? state.selectedUnit.nama_unit : ''} berhasil disimpan!`, 'success');
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
