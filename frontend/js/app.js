// SIMURS App Entry Point
import Store from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { initRouter } from './router.js';

async function init() {
  Store.loadFromStorage();
  const app = document.getElementById('app');
  const hash = window.location.hash || '#/login';

  if (!Store.isAuthenticated()) {
    window.location.hash = '#/login';
    const loginModule = await import('./pages/login.js');
    await loginModule.render(app);
    return;
  }

  const isCollapsed = localStorage.getItem('simurs_sidebar_collapsed') === 'true';

  // Render app shell
  app.innerHTML = `
    <div class="app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}">
      <div id="sidebar-container"></div>
      <div id="header-container"></div>
      <main class="main-content" id="main-content"></main>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-container'));
  renderHeader(document.getElementById('header-container'));

  // Sidebar toggle logic (Desktop & Mobile)
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('open');
      } else {
        const shell = document.querySelector('.app-shell');
        if (shell) {
          shell.classList.toggle('sidebar-collapsed');
          const collapsed = shell.classList.contains('sidebar-collapsed');
          localStorage.setItem('simurs_sidebar_collapsed', collapsed);
          window.dispatchEvent(new Event('sidebarToggle'));
        }
      }
    });
  }

  // Click outside sidebar to close on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('#sidebar-toggle')) {
        sidebar.classList.remove('open');
      }
    }
  });

  const mainContent = document.getElementById('main-content');
  if (hash === '#/login') window.location.hash = '#/dashboard';
  initRouter(mainContent);
}

// Boot
document.addEventListener('DOMContentLoaded', init);

// Re-init on login
window.addEventListener('userLoggedIn', init);
