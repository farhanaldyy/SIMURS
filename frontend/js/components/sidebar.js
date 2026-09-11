// Sidebar component
import Store from '../store.js';
import { NAV_GROUPS, ADMIN_GROUP } from '../config/modules.js';

export function renderSidebar(container, forceRebuild = false) {
  const hospitalInfo = Store.get('hospitalInfo');
  const logoUrl = (hospitalInfo && hospitalInfo.logo_url) ? hospitalInfo.logo_url : 'assets/img/logo.png';
  const hospitalName = (hospitalInfo && hospitalInfo.nama_rs) ? hospitalInfo.nama_rs : 'SIMURS';

  const existingSidebar = container.querySelector('#sidebar');
  if (existingSidebar && !forceRebuild) {
    const logoImg = existingSidebar.querySelector('.sidebar-logo img');
    const subText = existingSidebar.querySelector('.sidebar-logo-sub');
    if (logoImg && logoImg.getAttribute('src') !== logoUrl) logoImg.src = logoUrl;
    if (subText) {
      subText.textContent = hospitalName;
      subText.setAttribute('title', hospitalName);
    }
    updateActiveLink();
    return;
  }

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
    if (item.hash === '#/master-tindakan' || item.hash === '#/master-dokter') {
      return role === 'admin' || role === 'komite' || role === 'pic_mutu' || allowed.includes(item.hash);
    }
    if (item.hash === '#/master-poliklinik') {
      if (role === 'admin' || role === 'komite' || role === 'pic_mutu') return true;
      if (role === 'petugas') {
        const unitObj = (user && user.unit) || Store.get('unitAktif');
        if (unitObj) {
          const unitNama = (unitObj.nama_unit || '').toUpperCase();
          const unitKode = (unitObj.kode_unit || '').toUpperCase();
          return unitKode === 'RJ_POLIKLINIK' || unitNama.includes('POLI');
        }
      }
      return allowed.includes(item.hash);
    }
    if (role === 'admin' || role === 'komite') return true;
    return allowed.includes(item.hash);
  };

  const groups = NAV_GROUPS.map(g => ({
    title: g.title,
    items: g.items.filter(hasAccess)
  }));
  
  if (Store.isAdmin()) groups.push(ADMIN_GROUP);

  const currentHash = window.location.hash || '#/dashboard';

  const groupsHTML = groups
    .filter(g => g.items.length > 0)
    .map(group => {
      const spaceIndex = group.title.indexOf(' ');
      const icon = spaceIndex !== -1 ? group.title.substring(0, spaceIndex) : '📁';
      const label = spaceIndex !== -1 ? group.title.substring(spaceIndex + 1) : group.title;

      const itemsHTML = group.items.map(item => {
        const active = currentHash === item.hash ? 'active' : '';
        return `<li class="nav-item"><a href="${item.hash}" class="${active}">${item.label}</a></li>`;
      }).join('');

      return `
        <div class="nav-group">
          <div class="nav-group-title" title="${label}">
            <span class="nav-group-icon">${icon}</span>
            <span class="nav-group-text">${label}</span>
            <span class="chevron">▼</span>
          </div>
          <ul class="nav-items">
            <li class="nav-items-header">${label}</li>
            ${itemsHTML}
          </ul>
        </div>
      `;
    }).join('');

  // Preserve scroll position if sidebar exists
  const sidebarScrollTop = existingSidebar ? existingSidebar.scrollTop : 0;
  const navScrollTop = container.querySelector('.sidebar-nav')?.scrollTop || 0;

  container.innerHTML = `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="${logoUrl}" alt="${hospitalName} Logo" onerror="this.onerror=null; this.src='assets/img/logo.png';">
        <div>
          <span class="sidebar-logo-text">SISTEM MUTU</span>
          <span class="sidebar-logo-sub" title="${hospitalName}">${hospitalName}</span>
        </div>
      </div>
      <nav class="sidebar-nav">${groupsHTML}</nav>
    </div>
  `;

  const newSidebar = container.querySelector('#sidebar');
  if (newSidebar && sidebarScrollTop > 0) newSidebar.scrollTop = sidebarScrollTop;
  const newNav = container.querySelector('.sidebar-nav');
  if (newNav && navScrollTop > 0) newNav.scrollTop = navScrollTop;

  // Listen for dynamic updates to hospital info
  if (!container._hospitalInfoListenerBound) {
    container._hospitalInfoListenerBound = true;
    window.addEventListener('hospitalInfoChanged', () => {
      renderSidebar(container);
    });
  }

  // Toggle groups
  container.querySelectorAll('.nav-group-title').forEach(title => {
    title.addEventListener('click', () => {
      const isSidebarCollapsed = document.querySelector('.app-shell')?.classList.contains('sidebar-collapsed');
      if (!isSidebarCollapsed) {
        title.parentElement.classList.toggle('collapsed');
      }
    });
  });
}

export function updateActiveLink() {
  const currentHash = window.location.hash || '#/dashboard';
  document.querySelectorAll('.nav-item a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === currentHash);
  });
}
