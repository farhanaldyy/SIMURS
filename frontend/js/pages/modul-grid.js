import Store from '../store.js';
import { NAV_GROUPS, ADMIN_GROUP } from '../config/modules.js';

let searchInputListener = null;

export async function render(container) {
  // Determine all groups for this user
  const user = Store.get('user');
  const role = user ? user.role : '';
  let allowed = [];
  if (user && user.allowed_modules) {
    try {
      allowed = JSON.parse(user.allowed_modules);
    } catch (e) {
      allowed = [];
    }
  }

  const hasAccess = (item) => {
    if (item.hash === '#/dashboard') {
      return role !== 'petugas';
    }
    if (item.hash === '#/laporan') return true;
    if (item.hash === '#/modul') return true;
    if (item.hash === '#/master-tindakan') {
      return role === 'admin' || role === 'komite' || role === 'pic_mutu';
    }
    if (role === 'admin' || role === 'komite') return true;
    return allowed.includes(item.hash);
  };

  // Compile all groups. We skip "Dashboard & Laporan" (NAV_GROUPS[0]) because those are general dashboard menus,
  // but we display all indicator modules and admin modules if they exist.
  const activeGroups = NAV_GROUPS.slice(1).map(g => ({
    title: g.title,
    items: g.items
  }));

  if (Store.isAdmin()) {
    activeGroups.push(ADMIN_GROUP);
  }

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Daftar Modul</h1>
        <p class="page-subtitle">Akses cepat ke seluruh pencatatan dan pelaporan indikator mutu rumah sakit</p>
      </div>
    </div>

    <div class="filter-bar" style="margin-bottom: 24px; padding: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div style="position: relative; flex: 1; max-width: 400px; display: flex; align-items: center;">
        <span style="position: absolute; left: 14px; color: var(--color-text-secondary); font-size: 1.1rem;">🔍</span>
        <input type="text" id="module-search" placeholder="Cari modul atau kategori..." class="form-control" style="padding-left: 40px; height: 42px; border-radius: var(--radius-md);">
      </div>
      <div id="search-stats" style="font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500;"></div>
    </div>

    <div class="modules-grid-section" id="modules-grid-wrapper">
      <div class="modules-grid" id="modules-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${activeGroups.map((group, groupIdx) => {
          const spaceIndex = group.title.indexOf(' ');
          const icon = spaceIndex !== -1 ? group.title.substring(0, spaceIndex) : '📁';
          const label = spaceIndex !== -1 ? group.title.substring(spaceIndex + 1) : group.title;

          // Category border-top accent colors
          const categoryColors = {
            'keselamatan pasien': '#0ea5e9', // Sky blue
            'rawat inap': '#8b5cf6',         // Purple
            'igd': '#f97316',                // Orange
            'hemodialisa': '#14b8a6',         // Teal
            'operasi & anestesi': '#f43f5e',  // Rose
            'gizi': '#22c55e',               // Green
            'rawat jalan': '#3b82f6',        // Blue
            'rekam medis': '#6366f1',        // Indigo
            'rehabilitasi medis': '#ec4899',  // Pink
            'laundry': '#06b6d4',            // Cyan
            'mutu radiologi': '#64748b',     // Slate
            'simrs': '#6366f1',              // Indigo / Violet
            'master data': '#84cc16',        // Lime
            'admin': '#0f172a',              // Dark slate
          };
          const cleanLabel = label.toLowerCase().trim();
          const borderTopColor = categoryColors[cleanLabel] || 'var(--color-primary)';

          // Render group items with permission check
          const itemsHTML = group.items.map(item => {
            const accessible = hasAccess(item);
            if (accessible) {
              return `
                <a href="${item.hash}" class="module-menu-link" data-name="${item.label.toLowerCase()}">
                  <span class="link-label">${item.label}</span>
                  <span class="arrow">→</span>
                </a>
              `;
            } else {
              return `
                <div class="module-menu-link disabled" title="Anda tidak memiliki akses ke modul ini" data-name="${item.label.toLowerCase()}">
                  <span class="link-label"><span class="lock-icon" style="margin-right: 6px;">🔒</span>${item.label}</span>
                  <span class="badge badge-danger" style="font-size: 0.7rem; padding: 2px 6px;">Terkunci</span>
                </div>
              `;
            }
          }).join('');

          return `
            <div class="module-group-card card" data-group-index="${groupIdx}" data-title="${label.toLowerCase()}" style="border-top: 4px solid ${borderTopColor}; display: flex; flex-direction: column; gap: 16px; padding: 20px;">
              <div class="module-group-header" style="display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
                <span class="group-icon" style="font-size: 1.5rem;">${icon}</span>
                <h3 class="group-title" style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text);">${label}</h3>
              </div>
              <div class="module-group-links" style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                ${itemsHTML}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div id="modules-empty-state" class="empty-state hidden" style="padding: 48px; text-align: center; background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div class="empty-state-icon" style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
        <h3 style="margin-bottom: 8px; font-weight: 600; color: var(--color-text);">Tidak Ada Modul Ditemukan</h3>
        <p style="color: var(--color-text-secondary);">Coba masukkan kata kunci pencarian yang lain.</p>
      </div>
    </div>
  `;

  // Attach search listener
  const searchInput = document.getElementById('module-search');
  if (searchInput) {
    searchInputListener = () => {
      const query = searchInput.value.toLowerCase().trim();
      filterModules(query);
    };
    searchInput.addEventListener('input', searchInputListener);
    
    // Focus search bar
    searchInput.focus();
  }
}

function filterModules(query) {
  const cards = document.querySelectorAll('.module-group-card');
  const emptyState = document.getElementById('modules-empty-state');
  const searchStats = document.getElementById('search-stats');
  
  let visibleGroupsCount = 0;
  let totalVisibleItemsCount = 0;
  let totalItemsCount = 0;

  cards.forEach(card => {
    const groupTitle = card.getAttribute('data-title') || '';
    const links = card.querySelectorAll('.module-menu-link');
    let visibleItemsInGroup = 0;

    links.forEach(link => {
      totalItemsCount++;
      const name = link.getAttribute('data-name') || '';
      const matches = name.includes(query) || groupTitle.includes(query);

      if (matches) {
        link.classList.remove('hidden');
        visibleItemsInGroup++;
        totalVisibleItemsCount++;
      } else {
        link.classList.add('hidden');
      }
    });

    if (visibleItemsInGroup > 0) {
      card.style.display = 'flex';
      visibleGroupsCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (visibleGroupsCount === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  if (query) {
    searchStats.textContent = `Menampilkan ${totalVisibleItemsCount} dari ${totalItemsCount} modul`;
  } else {
    searchStats.textContent = '';
  }
}

export function destroy() {
  const searchInput = document.getElementById('module-search');
  if (searchInput && searchInputListener) {
    searchInput.removeEventListener('input', searchInputListener);
    searchInputListener = null;
  }
}
