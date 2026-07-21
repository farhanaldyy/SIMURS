// Header component
import Store from '../store.js';
import { logout } from '../api/auth.js';

export function renderHeader(container) {
  const user = Store.get('user');
  const initials = user ? user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

  container.innerHTML = `
    <div class="header" id="header">
      <div class="header-left">
        <button id="sidebar-toggle" class="sidebar-toggle-btn" title="Toggle Sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 class="header-title" id="page-title">Dashboard</h2>
      </div>
      <div class="header-right">
        <select class="header-select" id="header-periode-select">
          <option value="">Pilih Periode</option>
        </select>
        <select class="header-select" id="header-unit-select">
          <option value="">Semua Unit</option>
        </select>
        <div class="header-user">
          <div class="header-avatar">${initials}</div>
          <div>
            <div class="header-user-name">${user ? user.nama : '-'}</div>
            <div class="header-user-role">${user ? user.role : '-'}</div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-logout">Logout</button>
      </div>
    </div>
  `;

  // Populate dropdowns
  loadPeriodeOptions();
  loadUnitOptions();

  // Listen for changes in master lists to refresh selectors
  window.addEventListener('updateUnitsList', loadUnitOptions);
  window.addEventListener('updatePeriodesList', loadPeriodeOptions);

  // Logout handler
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await logout();
    Store.clear();
    window.location.hash = '#/login';
    window.location.reload();
  });

  // Periode change handler
  document.getElementById('header-periode-select').addEventListener('change', (e) => {
    const periodeId = e.target.value;
    const periode = Store.periodeList.find(p => p.id == periodeId);
    Store.set('periodeAktif', periode || null);
    window.dispatchEvent(new CustomEvent('periodeChanged'));
  });

  // Unit change handler
  document.getElementById('header-unit-select').addEventListener('change', (e) => {
    const unitId = e.target.value;
    const unit = Store.unitList.find(u => u.id == unitId);
    Store.set('unitAktif', unit || null);
    window.dispatchEvent(new CustomEvent('unitChanged'));
  });
}

async function loadPeriodeOptions() {
  const { getPeriode } = await import('../api/master.js');
  const res = await getPeriode();
  if (res.success) {
    Store.periodeList = res.data;
    
    // Default to current month and year if not set
    if (!Store.periodeAktif) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      let period = res.data.find(p => p.bulan === currentMonth && p.tahun === currentYear);
      
      if (!period) {
        // Try previous month
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = prev.getMonth() + 1;
        const prevYear = prev.getFullYear();
        period = res.data.find(p => p.bulan === prevMonth && p.tahun === prevYear);
      }
      
      if (!period) {
        // Try next month
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextMonth = next.getMonth() + 1;
        const nextYear = next.getFullYear();
        period = res.data.find(p => p.bulan === nextMonth && p.tahun === nextYear);
      }
      
      if (!period && res.data.length > 0) {
        // Fallback to latest
        period = res.data[0];
      }

      if (period) {
        Store.set('periodeAktif', period);
        window.dispatchEvent(new CustomEvent('periodeChanged'));
      }
    }

    const select = document.getElementById('header-periode-select');
    if (select) {
      const bulanNama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      select.innerHTML = '<option value="">Pilih Periode</option>' +
        res.data.map(p => {
          const selected = Store.periodeAktif && Store.periodeAktif.id === p.id ? 'selected' : '';
          return `<option value="${p.id}" ${selected}>${bulanNama[p.bulan]} ${p.tahun} ${p.status === 'closed' ? '🔒' : ''}</option>`;
        }).join('');
    }
  }
}

async function loadUnitOptions() {
  const { getUnits } = await import('../api/master.js');
  const res = await getUnits();
  if (res.success) {
    Store.unitList = res.data;

    const user = Store.get('user');
    if (user && user.unit_id) {
      if (user.role === 'petugas' || !Store.unitAktif) {
        const userUnit = res.data.find(u => u.id === user.unit_id);
        if (userUnit) {
          const changed = !Store.unitAktif || Store.unitAktif.id !== userUnit.id;
          Store.set('unitAktif', userUnit);
          if (changed) {
            window.dispatchEvent(new CustomEvent('unitChanged'));
          }
        }
      }
    }

    const select = document.getElementById('header-unit-select');
    if (select) {
      if (user && user.role === 'petugas' && user.unit_id) {
        select.innerHTML = res.data
          .filter(u => u.id === user.unit_id)
          .map(u => `<option value="${u.id}" selected>${u.nama_unit}</option>`)
          .join('');
        select.disabled = true;
      } else {
        select.disabled = false;
        select.innerHTML = '<option value="">Semua Unit</option>' +
          res.data.map(u => {
            const selected = Store.unitAktif && Store.unitAktif.id === u.id ? 'selected' : '';
            return `<option value="${u.id}" ${selected}>${u.nama_unit}</option>`;
          }).join('');
      }
    }
  }
}

export function setPageTitle(title) {
  const el = document.getElementById('page-title');
  if (el) el.textContent = title;
}
