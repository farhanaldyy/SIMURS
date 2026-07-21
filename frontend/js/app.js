// SIMURS App Entry Point
import Store from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { initRouter } from './router.js';
import { showModal } from './components/modal.js';

function checkPetugasWarning() {
  if (sessionStorage.getItem('show_petugas_warning') === 'true') {
    sessionStorage.removeItem('show_petugas_warning');
    setTimeout(() => {
      const contentHTML = `
        <div style="text-align: center; padding: 4px 0;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; color: #d97706;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span style="font-weight: 700; font-size: 1.15rem;">Pencegahan Kesalahan Input Data</span>
          </div>
          <p style="font-size: 0.95rem; color: #334155; margin-bottom: 16px; line-height: 1.5;">
            Mohon <strong>periksa kembali Periode dan Unit yang aktif</strong> pada bagian kanan atas (header) agar data yang dimasukkan sesuai dengan periode dan unit tempat Anda bertugas.
          </p>
          <div style="margin: 16px 0; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <img src="assets/img/peringatan-periode-unit.png" alt="Petunjuk Periode dan Unit Header" style="max-width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          </div>
        </div>
      `;

      showModal('Peringatan Pengecekan Periode & Unit', contentHTML, {
        confirmText: 'Saya Mengerti',
        btnClass: 'btn btn-primary',
        width: '600px'
      });
    }, 300);
  }
}

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
  checkPetugasWarning();
}

// Boot
document.addEventListener('DOMContentLoaded', init);

// Re-init on login
window.addEventListener('userLoggedIn', init);
