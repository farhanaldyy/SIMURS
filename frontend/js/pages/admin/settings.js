import { setPageTitle } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { showModal } from '../../components/modal.js';
import {
  getSettings,
  updateSettings,
  getInmMappings,
  updateInmMapping,
  getIntegrationLogs,
  simulateDryRunSync,
  exportSimarExcel,
} from '../../api/settings.js';
import Store from '../../store.js';

export async function render(container) {
  setPageTitle('Settings Center & Integration Config');

  container.innerHTML = `
    <div class="page-container" style="max-width: 1100px; margin: 0 auto; padding: 24px 16px;">
      
      <!-- Top Banner Header -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border: none; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25); position: relative; overflow: hidden; border-radius: 16px;">
        <div style="position: absolute; right: -20px; top: -20px; width: 160px; height: 160px; background: rgba(59, 130, 246, 0.15); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
        <div class="card-body" style="padding: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div id="banner-logo-wrapper" style="width: 72px; height: 72px; border-radius: 16px; background: #ffffff; padding: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-shrink: 0;">
              <img id="banner-logo-img" src="assets/img/logo.png" alt="Logo RS" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div>
              <h2 id="banner-nama-rs" style="margin: 0 0 6px 0; font-size: 1.5rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">Pusat Pengaturan & Integrasi</h2>
              <p id="banner-tagline" style="margin: 0; font-size: 0.9rem; color: #94a3b8;">Konfigurasi profil RS, mode integrasi Kemenkes (SIMAR/INM), dan audit log</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="badge-integration-mode" class="badge" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
              Mode: Sandbox
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; overflow-x: auto; padding-bottom: 2px;">
        <button id="tab-btn-profil" class="settings-tab-btn active" style="padding: 10px 20px; border: none; background: none; font-weight: 600; font-size: 0.95rem; color: #2563eb; border-bottom: 3px solid #2563eb; cursor: pointer;">
          🏥 Profil Rumah Sakit
        </button>
        <button id="tab-btn-mode" class="settings-tab-btn" style="padding: 10px 20px; border: none; background: none; font-weight: 600; font-size: 0.95rem; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
          ⚙️ Mode Integrasi & API Key
        </button>
        <button id="tab-btn-mapping" class="settings-tab-btn" style="padding: 10px 20px; border: none; background: none; font-weight: 600; font-size: 0.95rem; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
          📋 Pemetaan Kode INM Kemenkes
        </button>
        <button id="tab-btn-logs" class="settings-tab-btn" style="padding: 10px 20px; border: none; background: none; font-weight: 600; font-size: 0.95rem; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">
          🔄 Log Integrasi & Dry-Run
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="settings-tab-content">
        <!-- Content will be rendered dynamically -->
      </div>
    </div>
  `;

  let currentSettings = null;

  async function loadInitialData() {
    const res = await getSettings();
    if (res && res.success && res.data) {
      currentSettings = res.data;
      Store.setHospitalInfo(res.data);
      updateBanner(res.data);
    }
  }

  function updateBanner(data) {
    const logoUrl = data.logo_url || 'assets/img/logo.png';
    const bannerLogo = container.querySelector('#banner-logo-img');
    const bannerNama = container.querySelector('#banner-nama-rs');
    const modeBadge = container.querySelector('#badge-integration-mode');

    if (bannerLogo) bannerLogo.src = logoUrl;
    if (bannerNama) bannerNama.textContent = data.nama_rs || 'Pusat Pengaturan';
    
    if (modeBadge) {
      const mode = (data.integration_mode || 'sandbox').toUpperCase();
      modeBadge.textContent = `Mode: ${mode}`;
      if (mode === 'PRODUCTION') {
        modeBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        modeBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        modeBadge.style.color = '#f87171';
      } else if (mode === 'SANDBOX' || mode === 'DEVELOPMENT') {
        modeBadge.style.background = 'rgba(59, 130, 246, 0.2)';
        modeBadge.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        modeBadge.style.color = '#60a5fa';
      } else {
        modeBadge.style.background = 'rgba(100, 116, 139, 0.2)';
        modeBadge.style.borderColor = 'rgba(100, 116, 139, 0.4)';
        modeBadge.style.color = '#94a3b8';
      }
    }
  }

  await loadInitialData();

  // Tab Handlers
  const tabContent = container.querySelector('#settings-tab-content');
  const tabs = {
    profil: container.querySelector('#tab-btn-profil'),
    mode: container.querySelector('#tab-btn-mode'),
    mapping: container.querySelector('#tab-btn-mapping'),
    logs: container.querySelector('#tab-btn-logs'),
  };

  function switchTab(activeKey) {
    Object.keys(tabs).forEach((key) => {
      if (key === activeKey) {
        tabs[key].style.color = '#2563eb';
        tabs[key].style.borderBottom = '3px solid #2563eb';
      } else {
        tabs[key].style.color = '#64748b';
        tabs[key].style.borderBottom = '3px solid transparent';
      }
    });

    if (activeKey === 'profil') renderProfilTab();
    else if (activeKey === 'mode') renderModeTab();
    else if (activeKey === 'mapping') renderMappingTab();
    else if (activeKey === 'logs') renderLogsTab();
  }

  // TAB 1: PROFIL RS
  function renderProfilTab() {
    tabContent.innerHTML = `
      <div class="card shadow-sm" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div class="card-body" style="padding: 32px;">
          <form id="form-profil-rs" enctype="multipart/form-data">
            
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 16px;">📷 Logo & Identitas Visual</h3>
              <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <div style="width: 90px; height: 90px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; padding: 6px;">
                  <img id="preview-logo-img" src="${currentSettings?.logo_url || 'assets/img/logo.png'}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div style="flex: 1;">
                  <label style="font-weight: 600; font-size: 0.9rem; color: #334155;">Upload Logo Baru</label>
                  <input type="file" id="input-logo-file" name="logo" accept="image/*" class="form-control" style="font-size: 0.85rem; margin-top: 4px;">
                  <small style="color: #64748b;">Format PNG/JPG/SVG/WEBP (Maks 5MB)</small>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 24px;">
              <div class="form-group" style="grid-column: 1 / -1;">
                <label style="font-weight: 600; color: #334155;">Nama Rumah Sakit</label>
                <input type="text" name="nama_rs" class="form-control" value="${currentSettings?.nama_rs || ''}" required>
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">Kode RS / Fasyankes</label>
                <input type="text" name="kode_rs" class="form-control" value="${currentSettings?.kode_rs || ''}">
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">Kota / Kabupaten</label>
                <input type="text" name="kota" class="form-control" value="${currentSettings?.kota || ''}">
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label style="font-weight: 600; color: #334155;">Alamat Lengkap</label>
                <textarea name="alamat" class="form-control" rows="2">${currentSettings?.alamat || ''}</textarea>
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">Telepon</label>
                <input type="text" name="telepon" class="form-control" value="${currentSettings?.telepon || ''}">
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">Email Resmi</label>
                <input type="email" name="email" class="form-control" value="${currentSettings?.email || ''}">
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">Nama Direktur</label>
                <input type="text" name="nama_direktur" class="form-control" value="${currentSettings?.nama_direktur || ''}">
              </div>
              <div class="form-group">
                <label style="font-weight: 600; color: #334155;">NIP Direktur</label>
                <input type="text" name="nip_direktur" class="form-control" value="${currentSettings?.nip_direktur || ''}">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 600;">Simpan Profil RS</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = tabContent.querySelector('#form-profil-rs');
    const fileInput = tabContent.querySelector('#input-logo-file');
    const previewImg = tabContent.querySelector('#preview-logo-img');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => { previewImg.src = evt.target.result; };
        reader.readAsDataURL(file);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const res = await updateSettings(formData);
      if (res && res.success) {
        showToast('Profil RS berhasil diperbarui', 'success');
        currentSettings = res.data;
        updateBanner(res.data);
      } else {
        showToast(res?.message || 'Gagal menyimpan profil', 'error');
      }
    });
  }

  // TAB 2: MODE INTEGRASI & API KEY
  function renderModeTab() {
    tabContent.innerHTML = `
      <div class="card shadow-sm" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div class="card-body" style="padding: 32px;">
          <form id="form-mode-integrasi">
            
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 12px;">🌐 Environment & Integration Mode</h3>
              <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 20px;">
                Tentukan mode koneksi eksternal aplikasi. Mode <strong>Production</strong> membutuhkan proteksi tambahan.
              </p>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                <label style="border: 2px solid ${currentSettings?.integration_mode === 'development' ? '#2563eb' : '#e2e8f0'}; border-radius: 12px; padding: 16px; cursor: pointer; background: #ffffff;">
                  <input type="radio" name="integration_mode" value="development" ${currentSettings?.integration_mode === 'development' ? 'checked' : ''}>
                  <strong style="display: block; margin-top: 6px; color: #0f172a;">Development</strong>
                  <small style="color: #64748b;">Pengujian lokal & mock data API</small>
                </label>

                <label style="border: 2px solid ${currentSettings?.integration_mode === 'sandbox' ? '#2563eb' : '#e2e8f0'}; border-radius: 12px; padding: 16px; cursor: pointer; background: #ffffff;">
                  <input type="radio" name="integration_mode" value="sandbox" ${currentSettings?.integration_mode === 'sandbox' || !currentSettings?.integration_mode ? 'checked' : ''}>
                  <strong style="display: block; margin-top: 6px; color: #0f172a;">Sandbox / Staging</strong>
                  <small style="color: #64748b;">Uji coba server testing Kemenkes</small>
                </label>

                <label style="border: 2px solid ${currentSettings?.integration_mode === 'production' ? '#ef4444' : '#e2e8f0'}; border-radius: 12px; padding: 16px; cursor: pointer; background: #ffffff;">
                  <input type="radio" name="integration_mode" value="production" ${currentSettings?.integration_mode === 'production' ? 'checked' : ''}>
                  <strong style="display: block; margin-top: 6px; color: #ef4444;">Production ⚠️</strong>
                  <small style="color: #64748b;">Server live Kemenkes resmi</small>
                </label>

                <label style="border: 2px solid ${currentSettings?.integration_mode === 'disabled' ? '#64748b' : '#e2e8f0'}; border-radius: 12px; padding: 16px; cursor: pointer; background: #ffffff;">
                  <input type="radio" name="integration_mode" value="disabled" ${currentSettings?.integration_mode === 'disabled' ? 'checked' : ''}>
                  <strong style="display: block; margin-top: 6px; color: #64748b;">Disabled</strong>
                  <small style="color: #64748b;">Nonaktifkan seluruh sinkronisasi</small>
                </label>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- INM Credentials -->
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">🏛️ Konfigurasi INM Kemenkes (Indikator Nasional Mutu)</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 16px;">Kredensial resmi portal Mutu Fasyankes Kemenkes RI untuk pelaporan 13 Indikator Nasional Mutu.</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
                <div class="form-group">
                  <label style="font-weight: 600; color: #334155;">Kode Fasyankes Kemenkes</label>
                  <input type="text" name="kode_fasyankes" class="form-control" value="${currentSettings?.kode_fasyankes || ''}" placeholder="Contoh: 6371012">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label style="font-weight: 600; color: #334155;">Endpoint API INM</label>
                  <input type="url" name="inm_api_url" class="form-control" value="${currentSettings?.inm_api_url || 'https://mutufasyankes.kemkes.go.id/api/v1'}" placeholder="https://mutufasyankes.kemkes.go.id/api/v1">
                </div>
                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label style="font-weight: 600; color: #334155; margin: 0;">API Key / User Key INM</label>
                    <small style="font-size: 0.75rem; font-weight: 600; color: ${currentSettings?.inm_api_key ? '#16a34a' : '#ea580c'};">
                      ${currentSettings?.inm_api_key ? '✓ Sudah tersimpan' : '⚠️ Belum diisi'}
                    </small>
                  </div>
                  <input type="password" name="inm_api_key" class="form-control" value="${currentSettings?.inm_api_key || ''}" placeholder="••••••••••••••••••••••••">
                </div>
                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label style="font-weight: 600; color: #334155; margin: 0;">Secret Key INM</label>
                    <small style="font-size: 0.75rem; font-weight: 600; color: ${currentSettings?.inm_secret_key ? '#16a34a' : '#94a3b8'};">
                      ${currentSettings?.inm_secret_key ? '✓ Sudah tersimpan' : 'Opsional'}
                    </small>
                  </div>
                  <input type="password" name="inm_secret_key" class="form-control" value="${currentSettings?.inm_secret_key || ''}" placeholder="••••••••••••••••••••••••">
                </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- SIMAR Credentials -->
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">📊 Konfigurasi SIMAR Kemenkes</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 16px;">Kredensial pelaporan sistem akreditasi rumah sakit (SIMAR).</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label style="font-weight: 600; color: #334155;">Endpoint API SIMAR</label>
                  <input type="url" name="simar_api_url" class="form-control" value="${currentSettings?.simar_api_url || 'https://simar-api.kemkes.go.id/v1'}" placeholder="https://simar-api.kemkes.go.id/v1">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label style="font-weight: 600; color: #334155; margin: 0;">API Key / Secret Token SIMAR</label>
                    <small style="font-size: 0.75rem; font-weight: 600; color: ${currentSettings?.simar_api_key ? '#16a34a' : '#ea580c'};">
                      ${currentSettings?.simar_api_key ? '✓ Sudah tersimpan' : '⚠️ Belum diisi'}
                    </small>
                  </div>
                  <input type="password" name="simar_api_key" class="form-control" value="${currentSettings?.simar_api_key || ''}" placeholder="••••••••••••••••••••••••">
                </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- SATUSEHAT Credentials -->
            <div style="margin-bottom: 28px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 16px;">🏥 Credentials SATUSEHAT (Opsional)</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;">
                <div class="form-group">
                  <label style="font-weight: 600; color: #334155;">Organization ID</label>
                  <input type="text" name="satusehat_org_id" class="form-control" value="${currentSettings?.satusehat_org_id || ''}">
                </div>
                <div class="form-group">
                  <label style="font-weight: 600; color: #334155;">Client Key</label>
                  <input type="text" name="satusehat_client_key" class="form-control" value="${currentSettings?.satusehat_client_key || ''}">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label style="font-weight: 600; color: #334155;">Secret Key</label>
                  <input type="password" name="satusehat_secret_key" class="form-control" value="${currentSettings?.satusehat_secret_key || ''}">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 600;">Simpan Mode Integrasi</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = tabContent.querySelector('#form-mode-integrasi');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const dataObj = Object.fromEntries(formData.entries());

      const res = await updateSettings(dataObj);
      if (res && res.success) {
        showToast('Konfigurasi Mode Integrasi berhasil diperbarui', 'success');
        currentSettings = res.data;
        updateBanner(res.data);
      } else {
        showToast(res?.message || 'Gagal menyimpan pengaturan', 'error');
      }
    });
  }

  // TAB 3: PEMETAAN KODE INM
  async function renderMappingTab() {
    tabContent.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b;">Memuat data pemetaan kode INM...</div>`;

    const res = await getInmMappings();
    if (!res || !res.success) {
      tabContent.innerHTML = `<div class="alert alert-danger">Gagal memuat data pemetaan INM.</div>`;
      return;
    }

    const mappings = res.data || [];

    tabContent.innerHTML = `
      <div class="card shadow-sm" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div class="card-body" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0;">Pemetaan Indikator SIMURS ke Kode Resmi INM Kemenkes</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">Petakan indikator mutu internal rumah sakit dengan standar pelaporan Kemenkes RI.</p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="table table-hover" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 12px 16px;">Indikator SIMURS</th>
                  <th style="padding: 12px 16px;">Kode INM Kemenkes</th>
                  <th style="padding: 12px 16px;">Nama Resmi INM</th>
                  <th style="padding: 12px 16px; width: 100px;">Target</th>
                  <th style="padding: 12px 16px; width: 90px;">Satuan</th>
                  <th style="padding: 12px 16px; width: 100px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${mappings.map((m) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${m.nama_indikator_internal}</td>
                    <td style="padding: 12px 16px;">
                      <input type="text" class="form-control form-control-sm inp-kode" data-id="${m.id}" value="${m.kode_inm_kemenkes || ''}" placeholder="e.g. INM-01">
                    </td>
                    <td style="padding: 12px 16px;">
                      <input type="text" class="form-control form-control-sm inp-nama" data-id="${m.id}" value="${m.nama_inm_kemenkes || ''}" placeholder="Nama resmi INM">
                    </td>
                    <td style="padding: 12px 16px;">
                      <input type="number" step="0.01" class="form-control form-control-sm inp-target" data-id="${m.id}" value="${m.target_inm !== null ? m.target_inm : ''}">
                    </td>
                    <td style="padding: 12px 16px;">
                      <input type="text" class="form-control form-control-sm inp-satuan" data-id="${m.id}" value="${m.satuan || '%'}">
                    </td>
                    <td style="padding: 12px 16px;">
                      <button class="btn btn-sm btn-outline-primary btn-save-mapping" data-id="${m.id}" style="font-weight: 600;">Simpan</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Add save listeners
    tabContent.querySelectorAll('.btn-save-mapping').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const kode = tabContent.querySelector(`.inp-kode[data-id="${id}"]`).value;
        const nama = tabContent.querySelector(`.inp-nama[data-id="${id}"]`).value;
        const target = tabContent.querySelector(`.inp-target[data-id="${id}"]`).value;
        const satuan = tabContent.querySelector(`.inp-satuan[data-id="${id}"]`).value;

        btn.disabled = true;
        btn.textContent = '...';

        const updateRes = await updateInmMapping(id, {
          kode_inm_kemenkes: kode,
          nama_inm_kemenkes: nama,
          target_inm: target,
          satuan,
          aktif: true,
        });

        if (updateRes && updateRes.success) {
          showToast('Mapping berhasil disimpan', 'success');
        } else {
          showToast('Gagal mengupdate mapping', 'error');
        }

        btn.disabled = false;
        btn.textContent = 'Simpan';
      });
    });
  }

  // TAB 4: LOG INTEGRASI & DRY-RUN
  async function renderLogsTab() {
    tabContent.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b;">Memuat log sinkronisasi...</div>`;

    const res = await getIntegrationLogs();
    const logs = res?.success ? res.data || [] : [];

    tabContent.innerHTML = `
      <div class="card shadow-sm" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div class="card-body" style="padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0;">Log Integrasi & Dry-Run Test</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">Uji kelayakan payload pengiriman data ke Kemenkes dan pantau riwayat integrasi.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <button id="btn-export-simar-excel" class="btn btn-outline-primary" style="padding: 10px 18px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <span>📥</span> Ekspor SIMAR INM (.xlsx)
              </button>
              <button id="btn-run-dryrun" class="btn btn-success" style="padding: 10px 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <span>🧪</span> Jalankan Simulasi Dry-Run
              </button>
            </div>
          </div>

          <div id="dryrun-result-box" style="display: none; margin-bottom: 24px; padding: 20px; border-radius: 12px; background: #0f172a; color: #f8fafc; font-family: monospace; font-size: 0.85rem; overflow-x: auto;">
            <!-- Dry Run result output -->
          </div>

          <div style="overflow-x: auto;">
            <table class="table table-hover" style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 12px;">Waktu</th>
                  <th style="padding: 12px;">Target</th>
                  <th style="padding: 12px;">Aksi</th>
                  <th style="padding: 12px;">Status</th>
                  <th style="padding: 12px;">Keterangan / Error</th>
                  <th style="padding: 12px; text-align: center;">Detail</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">Belum ada log integrasi tersimpan.</td></tr>
                ` : logs.map((l) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px; color: #64748b;">${new Date(l.created_at).toLocaleString('id-ID')}</td>
                    <td style="padding: 12px; font-weight: 600;">${l.target_system}</td>
                    <td style="padding: 12px;">${l.action}</td>
                    <td style="padding: 12px;">
                      <span class="badge ${l.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}" style="padding: 4px 10px; border-radius: 12px;">${l.status}</span>
                    </td>
                    <td style="padding: 12px; color: #334155;">${l.error_message || 'OK'}</td>
                    <td style="padding: 12px; text-align: center;">
                      <button class="btn btn-sm btn-outline-info btn-view-log" data-log-id="${l.id}" style="font-weight: 600; padding: 4px 10px; font-size: 0.8rem;">
                        🔍 Detail
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;

    // Bind log detail view modal buttons
    tabContent.querySelectorAll('.btn-view-log').forEach((btn) => {
      btn.addEventListener('click', () => {
        const logId = parseInt(btn.getAttribute('data-log-id'), 10);
        const log = logs.find((item) => item.id === logId);
        if (!log) return;

        const formatJson = (val) => {
          if (!val) return '<em style="color: #94a3b8;">Tidak Ada Data / Kosong</em>';
          try {
            const parsed = typeof val === 'string' ? JSON.parse(val) : val;
            return JSON.stringify(parsed, null, 2);
          } catch {
            return String(val);
          }
        };

        const modalHtml = `
          <div style="font-size: 0.9rem; color: #334155;">
            
            <!-- Metadata Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <small style="color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">LOG ID & TARGET</small>
                <strong style="color: #0f172a; font-size: 0.95rem;">#${log.id} — ${log.target_system}</strong>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <small style="color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">AKSI / METODE</small>
                <strong style="color: #0f172a; font-size: 0.95rem;">${log.action}</strong>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <small style="color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">STATUS KONEKSI</small>
                <span class="badge ${log.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}" style="padding: 4px 10px; border-radius: 12px; font-weight: 600;">${log.status}</span>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <small style="color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">WAKTU EKSEKUSI</small>
                <strong style="color: #0f172a; font-size: 0.85rem;">${new Date(log.created_at).toLocaleString('id-ID')}</strong>
              </div>
            </div>

            ${log.error_message ? `
              <div class="alert alert-danger mb-3" style="border-radius: 8px; font-weight: 500;">
                ⚠️ <strong>Error Message:</strong> ${log.error_message}
              </div>
            ` : ''}

            <!-- Request Payload Code Box -->
            <div style="margin-bottom: 16px;">
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span>📤</span> Request Payload (JSON Sent)
              </h5>
              <pre style="background: #0f172a; color: #38bdf8; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 0.825rem; max-height: 220px; overflow-y: auto; margin: 0;"><code>${formatJson(log.payload)}</code></pre>
            </div>

            <!-- Server Response Code Box -->
            <div>
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span>📥</span> Server Response Body
              </h5>
              <pre style="background: #0f172a; color: #4ade80; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 0.825rem; max-height: 220px; overflow-y: auto; margin: 0;"><code>${formatJson(log.response)}</code></pre>
            </div>

          </div>
        `;

        showModal(`Detail Log Integrasi #${log.id}`, modalHtml, { width: '800px', confirmText: 'Tutup' });
      });
    });

    const dryRunBtn = tabContent.querySelector('#btn-run-dryrun');
    const exportExcelBtn = tabContent.querySelector('#btn-export-simar-excel');
    const resultBox = tabContent.querySelector('#dryrun-result-box');

    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', async () => {
        const now = new Date();
        const bulan = now.getMonth() + 1;
        const tahun = now.getFullYear();
        showToast('Mengunduh Laporan SIMAR INM (.xlsx)...', 'info');
        await exportSimarExcel(bulan, tahun);
        setTimeout(() => renderLogsTab(), 1500);
      });
    }

    dryRunBtn.addEventListener('click', async () => {
      dryRunBtn.disabled = true;
      dryRunBtn.textContent = 'Memproses Simulasi...';

      const simRes = await simulateDryRunSync('SIMAR');
      resultBox.style.display = 'block';

      if (simRes && simRes.success) {
        showToast('Simulasi Dry-Run Berhasil!', 'success');
        resultBox.style.borderLeft = '4px solid #22c55e';
        resultBox.innerHTML = `
          <strong style="color: #4ade80;">[SIMULASI SUCCESS] ${simRes.message}</strong>\n
          ${JSON.stringify(simRes.data, null, 2)}
        `;
      } else {
        showToast(simRes?.message || 'Simulasi Gagal', 'error');
        resultBox.style.borderLeft = '4px solid #ef4444';
        resultBox.innerHTML = `
          <strong style="color: #f87171;">[SIMULASI FAILED] ${simRes?.message || 'Gagal'}</strong>\n
          ${JSON.stringify(simRes?.data || {}, null, 2)}
        `;
      }

      dryRunBtn.disabled = false;
      dryRunBtn.innerHTML = `<span>🧪</span> Jalankan Simulasi Dry-Run`;
      
      // Refresh logs list
      setTimeout(() => renderLogsTab(), 2000);
    });
  }

  // Event Listeners for Tabs
  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener('click', () => switchTab(key));
  });

  // Render Default Active Tab
  renderProfilTab();
}
