import { updateActiveLink } from './components/sidebar.js';
import { setPageTitle } from './components/header.js';
import Store from './store.js';

const routes = {
  '#/login':                      { module: () => import('./pages/login.js'), title: 'Login' },
  '#/dashboard':                  { module: () => import('./pages/dashboard.js'), title: 'Dashboard' },
  '#/laporan':                    { module: () => import('./pages/laporan.js'), title: 'Cetak Laporan' },
  '#/modul':                      { module: () => import('./pages/modul-grid.js'), title: 'Daftar Modul' },
  
  // Keselamatan Pasien
  '#/risiko-jatuh':               { module: () => import('./pages/modules/risiko-jatuh.js'), title: 'Risiko Jatuh' },
  '#/insiden-keselamatan':        { module: () => import('./pages/modules/insiden-keselamatan.js'), title: 'Insiden Keselamatan Pasien' },
  '#/identifikasi-pasien':        { module: () => import('./pages/modules/identifikasi-pasien.js'), title: 'Identifikasi Pasien' },
  '#/reaksi-transfusi':           { module: () => import('./pages/modules/reaksi-transfusi.js'), title: 'Reaksi Transfusi' },
  '#/gelang-identitas':           { module: () => import('./pages/modules/gelang-identitas.js'), title: 'Gelang Identitas' },
  '#/kepatuhan-kebersihan-tangan': { module: () => import('./pages/modules/kepatuhan-kebersihan-tangan.js'), title: 'Kepatuhan Kebersihan Tangan' },
  '#/kepatuhan-apd':              { module: () => import('./pages/modules/kepatuhan-apd.js'), title: 'Kepatuhan Penggunaan APD' },
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
  '#/mutu-kamar-operasi':          { module: () => import('./pages/modules/mutu-kamar-operasi.js'), title: 'Standar Minimal Mutu Kamar Operasi' },

  // Gizi
  '#/gizi-waktu-makanan':         { module: () => import('./pages/modules/gizi-waktu-makanan.js'), title: 'Ketepatan Waktu Pemberian Makanan' },
  '#/gizi-sisa-makanan':          { module: () => import('./pages/modules/gizi-sisa-makanan.js'), title: 'Sisa Makanan Yang Tidak Termakan' },
  '#/gizi-kesalahan-diet':         { module: () => import('./pages/modules/gizi-kesalahan-diet.js'), title: 'Tidak Adanya Kesalahan Pemberian Diet' },
  '#/gizi-identifikasi-pasien':   { module: () => import('./pages/modules/gizi-identifikasi-pasien.js'), title: 'Kepatuhan Identifikasi Pasien (SIMRS)' },
 
  // Admin Panel
  '#/admin/users':                { module: () => import('./pages/admin/users.js'), title: 'Kelola Pengguna' },
  '#/admin/units':                { module: () => import('./pages/admin/units.js'), title: 'Kelola Unit' },
  '#/admin/periode':              { module: () => import('./pages/admin/periode.js'), title: 'Kelola Periode' },
  '#/admin/audit-log':            { module: () => import('./pages/admin/audit-log.js'), title: 'Audit Trail' },
  '#/master-tindakan':            { module: () => import('./pages/modules/master-tindakan.js'), title: 'Master Tindakan' },
  '#/master-poliklinik':          { module: () => import('./pages/modules/master-poliklinik.js'), title: 'Master Poliklinik' },
  '#/waktu-tunggu-poliklinik':    { module: () => import('./pages/modules/waktu-tunggu-poliklinik.js'), title: 'Waktu Tunggu Poliklinik' },
  '#/waktu-tunggu-operasi-elektif': { module: () => import('./pages/modules/waktu-tunggu-operasi.js'), title: 'Waktu Tunggu Operasi Elektif' },
  '#/mutu-rekam-medis':           { module: () => import('./pages/modules/mutu-rekam-medis.js'), title: 'Standar Minimal Mutu Rekam Medis' },
  
  // Rehabilitasi Medis
  '#/rehab-drop-out':             { module: () => import('./pages/modules/rehab-drop-out.js'), title: 'Drop Out Pasien' },
  '#/rehab-kesalahan-tindakan':   { module: () => import('./pages/modules/rehab-kesalahan-tindakan.js'), title: 'Tidak Adanya Kejadian Kesalahan Tindakan' },
  '#/rehab-waktu-tunggu':        { module: () => import('./pages/modules/rehab-waktu-tunggu.js'), title: 'Waktu Tunggu Pelayanan Rehab' },
  '#/rehab-kepatuhan-identitas':  { module: () => import('./pages/modules/rehab-kepatuhan-identitas.js'), title: 'Kepatuhan Identitas Pasien' },
  '#/rehab-kepuasan-pasien':      { module: () => import('./pages/modules/rehab-kepuasan-pasien.js'), title: 'Kepuasan Pasien Rehab' },

  // Laundry
  '#/laundry-ketepatan-linen':    { module: () => import('./pages/modules/laundry-ketepatan-linen.js'), title: 'Ketepatan Waktu Penyediaan Linen Bersih' },
  '#/laundry-linen-hilang':       { module: () => import('./pages/modules/laundry-linen-hilang.js'), title: 'Tidak Adanya Kejadian Linen Hilang' },

  // Radiologi
  '#/radiologi-jadwal-dokter':              { module: () => import('./pages/modules/radiologi-jadwal-dokter.js'), title: 'Jadwal Dokter Radiologi' },
  '#/radiologi-thorax-sesuai-jadwal':       { module: () => import('./pages/modules/radiologi-thorax-sesuai-jadwal.js'), title: 'Waktu Tunggu Thorax Sesuai Jadwal' },
  '#/radiologi-thorax-luar-jadwal':         { module: () => import('./pages/modules/radiologi-thorax-luar-jadwal.js'), title: 'Waktu Tunggu Thorax Diluar Jadwal' },
  '#/radiologi-foto-ulang':                 { module: () => import('./pages/modules/radiologi-foto-ulang.js'), title: 'Kejadian Foto Ulang Pasien' },
  '#/radiologi-info-tindakan':              { module: () => import('./pages/modules/radiologi-info-tindakan.js'), title: 'Kelengkapan Info Tindakan' },
  '#/radiologi-identifikasi-pasien':        { module: () => import('./pages/modules/radiologi-identifikasi-pasien.js'), title: 'Kepatuhan Identifikasi Pasien' },

  // Laboratorium
  '#/laboratorium-jadwal-dokter':              { module: () => import('./pages/modules/laboratorium-jadwal-dokter.js'), title: 'Jadwal Dokter Laboratorium' },
  '#/laboratorium-waktu-tunggu-lt-140':       { module: () => import('./pages/modules/laboratorium-waktu-tunggu-lt-140.js'), title: 'Waktu Tunggu Lab < 140 Menit' },
  '#/laboratorium-waktu-tunggu-gt-140':       { module: () => import('./pages/modules/laboratorium-waktu-tunggu-gt-140.js'), title: 'Waktu Tunggu Lab > 140 Menit' },
  '#/laboratorium-hasil-kritis':              { module: () => import('./pages/modules/laboratorium-hasil-kritis.js'), title: 'Pelaporan Hasil Kritis Lab ≤ 30 Menit' },
  '#/laboratorium-kesalahan-input':           { module: () => import('./pages/modules/laboratorium-kesalahan-input.js'), title: 'Tidak Adanya Kesalahan Input Lab' },
  '#/laboratorium-kerusakan-sampel':          { module: () => import('./pages/modules/laboratorium-kerusakan-sampel.js'), title: 'Tidak Adanya Kerusakan Sampel Lab' },
  '#/laboratorium-kepatuhan-identifikasi':    { module: () => import('./pages/modules/laboratorium-kepatuhan-identifikasi.js'), title: 'Kepatuhan Identifikasi Pasien Lab' },
  '#/laboratorium-ekspertisi-dokter':         { module: () => import('./pages/modules/laboratorium-ekspertisi-dokter.js'), title: 'Data Ekspertisi Oleh Dokter Lab' },
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
    // petugas can only access login, laporan, modul, and their allowed modules (specifically block dashboard and admin)
    if (hash === '#/dashboard' || isAdminRoute || (hash !== '#/laporan' && hash !== '#/modul' && !allowed.includes(hash))) {
      renderAccessDenied(contentContainer);
      return;
    }
  } else if (role === 'pic_mutu') {
    // pic_mutu can access dashboard, laporan, master-tindakan, modul, and their allowed modules
    const isGeneralRoute = hash === '#/dashboard' || hash === '#/laporan' || hash === '#/master-tindakan' || hash === '#/modul';
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
