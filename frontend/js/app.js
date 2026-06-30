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

  // Render app shell
  app.innerHTML = `
    <div class="app-shell">
      <div id="sidebar-container"></div>
      <div id="header-container"></div>
      <main class="main-content" id="main-content"></main>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-container'));
  renderHeader(document.getElementById('header-container'));

  const mainContent = document.getElementById('main-content');
  if (hash === '#/login') window.location.hash = '#/dashboard';
  initRouter(mainContent);
}

// Boot
document.addEventListener('DOMContentLoaded', init);

// Re-init on login
window.addEventListener('userLoggedIn', init);
