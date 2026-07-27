import { setPageTitle } from '../../components/header.js';
import { showToast } from '../../components/toast.js';
import { getInformasiRS, updateInformasiRS } from '../../api/informasi-rs.js';
import Store from '../../store.js';

export async function render(container) {
  setPageTitle('Kelola Informasi Rumah Sakit');

  container.innerHTML = `
    <div class="page-container" style="max-width: 1000px; margin: 0 auto; padding: 24px 16px;">
      
      <!-- Top Banner Header -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border: none; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25); position: relative; overflow: hidden;">
        <div style="position: absolute; right: -20px; top: -20px; width: 160px; height: 160px; background: rgba(59, 130, 246, 0.15); border-radius: 50%; blur: 40px; pointer-events: none;"></div>
        <div class="card-body" style="padding: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div id="banner-logo-wrapper" style="width: 72px; height: 72px; border-radius: 16px; background: #ffffff; padding: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-shrink: 0;">
              <img id="banner-logo-img" src="assets/img/logo.png" alt="Logo RS" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div>
              <h2 id="banner-nama-rs" style="margin: 0 0 6px 0; font-size: 1.5rem; font-weight: 700; color: #f8fafc; tracking-tight;">Memuat Data RS...</h2>
              <p id="banner-tagline" style="margin: 0; font-size: 0.9rem; color: #94a3b8;">Pengaturan identitas & profil resmi rumah sakit</p>
            </div>
          </div>
          <span style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; padding: 6px 14px; border-radius: 20px; font-size: 0.825rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span> Profil Aktif Sistem
          </span>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="card shadow-sm" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div class="card-body" style="padding: 32px;">
          <form id="form-informasi-rs" enctype="multipart/form-data">
            
            <!-- Section 1: Logo & Branding -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <span>📷</span> Logo & Identitas Visual
              </h3>
              
              <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <div style="width: 100px; height: 100px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; padding: 8px; flex-shrink: 0;">
                  <img id="preview-logo-img" src="assets/img/logo.png" alt="Preview Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div style="flex: 1; min-width: 240px;">
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; color: #334155; margin-bottom: 6px;">Upload File Logo Baru</label>
                  <input type="file" id="input-logo-file" name="logo" accept="image/png, image/jpeg, image/webp, image/svg+xml" class="form-control" style="font-size: 0.875rem; margin-bottom: 6px;">
                  <small style="color: #64748b; display: block; font-size: 0.8rem;">Format: PNG, JPG, WEBP, atau SVG. Maksimal file 5MB. Direkomendasikan rasio 1:1 atau simetris.</small>
                </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- Section 2: Informasi Utama RS -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <span>🏥</span> Profil Utama Rumah Sakit
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label for="nama_rs" style="font-weight: 600; color: #334155;">Nama Rumah Sakit <span style="color: #ef4444;">*</span></label>
                  <input type="text" id="nama_rs" name="nama_rs" class="form-control" required placeholder="Contoh: RS Islam Kalimantan Muhammad Arsyad Al Banjari">
                </div>

                <div class="form-group">
                  <label for="kode_rs" style="font-weight: 600; color: #334155;">Kode RS / Fasyankes</label>
                  <input type="text" id="kode_rs" name="kode_rs" class="form-control" placeholder="Contoh: 6371012">
                </div>

                <div class="form-group">
                  <label for="kota" style="font-weight: 600; color: #334155;">Kota / Kabupaten</label>
                  <input type="text" id="kota" name="kota" class="form-control" placeholder="Contoh: Banjarmasin">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                  <label for="alamat" style="font-weight: 600; color: #334155;">Alamat Lengkap</label>
                  <textarea id="alamat" name="alamat" class="form-control" rows="2" placeholder="Contoh: Jl. S. Parman No. 88, Antasan Besar, Banjarmasin Tengah"></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                  <label for="deskripsi" style="font-weight: 600; color: #334155;">Slogan / Tagline Sistem</label>
                  <input type="text" id="deskripsi" name="deskripsi" class="form-control" placeholder="Contoh: Sistem Informasi Mutu Rumah Sakit — Menjaga Mutu dan Keselamatan Pasien">
                </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- Section 3: Kontak Resmi -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <span>📞</span> Kontak Resmi & Website
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
                <div class="form-group">
                  <label for="telepon" style="font-weight: 600; color: #334155;">No. Telepon / Fax</label>
                  <input type="text" id="telepon" name="telepon" class="form-control" placeholder="Contoh: (0511) 3354884">
                </div>

                <div class="form-group">
                  <label for="email" style="font-weight: 600; color: #334155;">Email Resmi</label>
                  <input type="email" id="email" name="email" class="form-control" placeholder="Contoh: rsik.banjarmasin@gmail.com">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                  <label for="website" style="font-weight: 600; color: #334155;">Website Resmi</label>
                  <input type="url" id="website" name="website" class="form-control" placeholder="Contoh: https://rsik-banjarmasin.co.id">
                </div>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;">

            <!-- Section 4: Pimpinan / Direktur RS -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <span>👨‍⚕️</span> Direktur / Pimpinan Rumah Sakit
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <div class="form-group">
                  <label for="nama_direktur" style="font-weight: 600; color: #334155;">Nama Direktur / Kepala RS</label>
                  <input type="text" id="nama_direktur" name="nama_direktur" class="form-control" placeholder="Contoh: dr. H. Mastemer, Sp.B">
                </div>

                <div class="form-group">
                  <label for="nip_direktur" style="font-weight: 600; color: #334155;">NIP / NIK Direktur</label>
                  <input type="text" id="nip_direktur" name="nip_direktur" class="form-control" placeholder="Contoh: 19700101 200003 1 001">
                </div>
              </div>
            </div>

            <!-- Form Action Submit -->
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
              <button type="submit" id="btn-save-info" class="btn btn-primary" style="padding: 10px 28px; font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Simpan Perubahan
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `;

  // Populate data
  await loadData(container);

  // Bind live file preview
  const fileInput = container.querySelector('#input-logo-file');
  const previewImg = container.querySelector('#preview-logo-img');
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        previewImg.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit Handler
  const form = container.querySelector('#form-informasi-rs');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#btn-save-info');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Memproses...';

    try {
      const formData = new FormData(form);
      const res = await updateInformasiRS(formData);
      
      if (res && res.success) {
        showToast(res.message || 'Informasi Rumah Sakit berhasil diperbarui!', 'success');
        Store.setHospitalInfo(res.data);
        await loadData(container);
      } else {
        showToast(res.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

async function loadData(container) {
  const res = await getInformasiRS();
  if (res && res.success && res.data) {
    const d = res.data;
    Store.setHospitalInfo(d);

    // Populate inputs
    const setVal = (id, val) => {
      const el = container.querySelector(`#${id}`);
      if (el) el.value = val || '';
    };

    setVal('nama_rs', d.nama_rs);
    setVal('kode_rs', d.kode_rs);
    setVal('alamat', d.alamat);
    setVal('kota', d.kota);
    setVal('deskripsi', d.deskripsi);
    setVal('telepon', d.telepon);
    setVal('email', d.email);
    setVal('website', d.website);
    setVal('nama_direktur', d.nama_direktur);
    setVal('nip_direktur', d.nip_direktur);

    // Update banner & previews
    const logoUrl = d.logo_url ? d.logo_url : 'assets/img/logo.png';
    const bannerLogo = container.querySelector('#banner-logo-img');
    const previewLogo = container.querySelector('#preview-logo-img');
    const bannerNama = container.querySelector('#banner-nama-rs');
    const bannerTagline = container.querySelector('#banner-tagline');

    if (bannerLogo) bannerLogo.src = logoUrl;
    if (previewLogo) previewLogo.src = logoUrl;
    if (bannerNama) bannerNama.textContent = d.nama_rs || 'Informasi Rumah Sakit';
    if (bannerTagline) bannerTagline.textContent = d.deskripsi || 'Pengaturan identitas & profil resmi rumah sakit';
  }
}
