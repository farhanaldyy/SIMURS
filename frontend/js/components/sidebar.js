// Sidebar component
import Store from '../store.js';
import { NAV_GROUPS, ADMIN_GROUP } from '../config/modules.js';

export function renderSidebar(container) {
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
      const itemsHTML = group.items.map(item => {
        const active = currentHash === item.hash ? 'active' : '';
        return `<li class="nav-item"><a href="${item.hash}" class="${active}">${item.label}</a></li>`;
      }).join('');

      return `
        <div class="nav-group">
          <div class="nav-group-title">${group.title} <span class="chevron">▼</span></div>
          <ul class="nav-items">${itemsHTML}</ul>
        </div>
      `;
    }).join('');

  container.innerHTML = `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="assets/img/logo.png" alt="SIMURS Logo">
        <div>
          <span class="sidebar-logo-text">SIMURS</span>
          <span class="sidebar-logo-sub">Mutu Rumah Sakit</span>
        </div>
      </div>
      <nav class="sidebar-nav">${groupsHTML}</nav>
    </div>
  `;

  // Toggle groups
  container.querySelectorAll('.nav-group-title').forEach(title => {
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('collapsed');
    });
  });
}

export function updateActiveLink() {
  const currentHash = window.location.hash || '#/dashboard';
  document.querySelectorAll('.nav-item a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === currentHash);
  });
}
