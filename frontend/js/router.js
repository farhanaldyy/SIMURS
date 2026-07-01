import { updateActiveLink } from './components/sidebar.js';
import { setPageTitle } from './components/header.js';
import Store from './store.js';

const routes = {
  '#/login':                      { module: () => import('./pages/login.js'), title: 'Login' },
  '#/dashboard':                  { module: () => import('./pages/dashboard.js'), title: 'Dashboard' },
  '#/laporan':                    { module: () => import('./pages/laporan.js'), title: 'Cetak Laporan' },
  
  // Keselamatan Pasien
  '#/risiko-jatuh':               { module: () => import('./pages/modules/risiko-jatuh.js'), title: 'Risiko Jatuh' },
  '#/insiden-keselamatan':        { module: () => import('./pages/modules/insiden-keselamatan.js'), title: 'Insiden Keselamatan Pasien' },
  '#/identifikasi-pasien':        { module: () => import('./pages/modules/identifikasi-pasien.js'), title: 'Identifikasi Pasien' },
  '#/reaksi-transfusi':           { module: () => import('./pages/modules/reaksi-transfusi.js'), title: 'Reaksi Transfusi' },
  '#/gelang-identitas':           { module: () => import('./pages/modules/gelang-identitas.js'), title: 'Gelang Identitas' },
  '#/serah-terima-pasien':        { module: () => import('./pages/modules/serah-terima-pasien.js'), title: 'Serah Terima Pasien' },
  
  // Rawat Inap
  '#/angka-kematian-ranap':       { module: () => import('./pages/modules/angka-kematian-ranap.js'), title: 'Angka Kematian Ranap' },
  '#/double-check-high-alert':    { module: () => import('./pages/modules/double-check-high-alert.js'), title: 'Double Check High Alert' },
  '#/visit-dokter':               { module: () => import('./pages/modules/visit-dokter.js'), title: 'Visit Dokter Spesialis' },
  '#/kembali-icu':                { module: () => import('./pages/modules/kembali-icu.js'), title: 'Kembali ICU < 72 Jam' },
  '#/alur-klinis':               { module: () => import('./pages/modules/alur-klinis.js'), title: 'Alur Klinis (Clinical Pathway)' },
  
  // IGD
  '#/waktu-tanggap-sc':          { module: () => import('./pages/modules/waktu-tanggap-sc.js'), title: 'Waktu Tanggap SC Emergency' },
  '#/emergency-response-time':    { module: () => import('./pages/modules/emergency-response-time.js'), title: 'Emergency Response Time' },
  '#/angka-kematian-igd':         { module: () => import('./pages/modules/angka-kematian-igd.js'), title: 'Angka Kematian IGD' },
  '#/asesmen-awal-igd':           { module: () => import('./pages/modules/asesmen-awal-igd.js'), title: 'Asesmen Awal IGD' },
  '#/pasien-tertahan-igd':        { module: () => import('./pages/modules/pasien-tertahan-igd.js'), title: 'Pasien Tertahan IGD' },
  
  // Hemodialisa (HD)
  '#/ketidakpatuhan-hd':          { module: () => import('./pages/modules/ketidakpatuhan-hd.js'), title: 'Ketidakpatuhan Pasien HD' },
  '#/insiden-clotting':           { module: () => import('./pages/modules/insiden-clotting.js'), title: 'Insiden Clotting Durante HD' },
  '#/insiden-jarum-vena':         { module: () => import('./pages/modules/insiden-jarum-vena.js'), title: 'Insiden Jarum Vena Fistula' },
  
  // Operasi & Anestesi
  '#/penundaan-operasi':          { module: () => import('./pages/modules/penundaan-operasi.js'), title: 'Penundaan Operasi Elektif' },
  '#/informed-consent-pembedahan':{ module: () => import('./pages/modules/informed-consent-pembedahan.js'), title: 'Informed Consent Pembedahan' },
  '#/informed-consent-anestesi':  { module: () => import('./pages/modules/informed-consent-anestesi.js'), title: 'Informed Consent Anestesi' },
  '#/asesmen-pra-bedah':          { module: () => import('./pages/modules/asesmen-pra-bedah.js'), title: 'Asesmen Pra Bedah' },
  '#/asesmen-pra-anestesi':        { module: () => import('./pages/modules/asesmen-pra-anestesi.js'), title: 'Asesmen Pra Anestesi' },
  '#/surgical-checklist-sc':      { module: () => import('./pages/modules/surgical-checklist-sc.js'), title: 'Surgical Safety Checklist SC' },
  '#/surgical-checklist-operasi': { module: () => import('./pages/modules/surgical-checklist-operasi.js'), title: 'Surgical Safety Checklist Operasi' },
  '#/penandaan-lokasi-operasi':   { module: () => import('./pages/modules/penandaan-lokasi-operasi.js'), title: 'Penandaan Lokasi Operasi' },
 
  // Admin Panel
  '#/admin/users':                { module: () => import('./pages/admin/users.js'), title: 'Kelola Pengguna' },
  '#/admin/periode':              { module: () => import('./pages/admin/periode.js'), title: 'Kelola Periode' },
  '#/admin/audit-log':            { module: () => import('./pages/admin/audit-log.js'), title: 'Audit Trail' },
};

let currentPage = null;

export async function initRouter(contentContainer) {
  window.addEventListener('hashchange', () => handleRoute(contentContainer));
  handleRoute(contentContainer);
}

async function handleRoute(contentContainer) {
  let hash = window.location.hash || '#/dashboard';

  // Get user details
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

  // Redirect petugas from dashboard to their first allowed module
  if (hash === '#/dashboard' && role === 'petugas') {
    if (allowed.length > 0) {
      window.location.hash = allowed[0];
      return;
    }
  }

  // Destroy previous page
  if (currentPage && currentPage.destroy) {
    currentPage.destroy();
  }

  const route = routes[hash];
  if (!route) {
    const homeLink = role === 'petugas' && allowed.length > 0 ? allowed[0] : '#/dashboard';
    contentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Halaman tidak ditemukan</h3>
        <p><a href="${homeLink}">Kembali</a></p>
      </div>
    `;
    return;
  }

  // Authorize route
  const isAdminRoute = hash.startsWith('#/admin/');

  if (hash === '#/login') {
    // login is always accessible
  } else if (role === 'petugas') {
    // petugas can only access login, laporan, and their allowed modules (specifically block dashboard and admin)
    if (hash === '#/dashboard' || isAdminRoute || (hash !== '#/laporan' && !allowed.includes(hash))) {
      renderAccessDenied(contentContainer);
      return;
    }
  } else if (role === 'pic_mutu') {
    // pic_mutu can access dashboard, laporan, and their allowed modules
    const isGeneralRoute = hash === '#/dashboard' || hash === '#/laporan';
    if (!isGeneralRoute && !allowed.includes(hash)) {
      renderAccessDenied(contentContainer);
      return;
    }
  } else if (role === 'komite') {
    // komite can access everything except admin routes
    if (isAdminRoute) {
      renderAccessDenied(contentContainer);
      return;
    }
  } else if (role === 'admin') {
    // admin can access everything
  } else {
    // unauthenticated - redirect to login
    window.location.hash = '#/login';
    return;
  }

  // Update UI
  setPageTitle(route.title);
  updateActiveLink();

  // Load and render page
  try {
    let pageModule = await route.module();
    if (pageModule.default) {
      pageModule = pageModule.default;
    }
    currentPage = pageModule;
    await pageModule.render(contentContainer);
  } catch (err) {
    console.error('Route error:', err);
    contentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Gagal memuat halaman</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function renderAccessDenied(container) {
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

  const homeLink = role === 'petugas' && allowed.length > 0 ? allowed[0] : '#/dashboard';
  const homeText = role === 'petugas' ? 'Kembali ke Halaman Modul' : 'Kembali ke Dashboard';

  setPageTitle('Akses Ditolak');
  updateActiveLink();
  container.innerHTML = `
    <div class="empty-state" style="padding: 40px; text-align: center;">
      <div class="empty-state-icon" style="color: #dc3545; font-size: 3em; margin-bottom: 20px;">⛔</div>
      <h3 style="margin-bottom: 10px;">Akses Ditolak</h3>
      <p style="color: #666; margin-bottom: 20px;">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <p><a href="${homeLink}" class="btn btn-primary" style="text-decoration: none;">${homeText}</a></p>
    </div>
  `;
}
