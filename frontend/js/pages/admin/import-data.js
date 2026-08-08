import Store from '../../store.js';
import { showToast } from '../../components/toast.js';
import { applyPeriodLockUI, checkAndNotifyLock } from '../../utils/lock-helper.js';

async function downloadTemplateFile() {
  showToast('Menyiapkan template Excel...', 'info');
  try {
    const token = Store.get('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/laporan/template-excel', { headers });
    if (!res.ok) throw new Error('Gagal mengunduh template');

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'Template_Import_SIMURS.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Template Excel berhasil diunduh', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal mengekspor template Excel', 'error');
  }
}

async function handleImport(e) {
  e.preventDefault();
  if (checkAndNotifyLock()) return;

  const fileInput = document.getElementById('input-import-file');
  const file = fileInput ? fileInput.files[0] : null;

  if (!file) {
    showToast('Pilih file Excel terlebih dahulu', 'error');
    return;
  }

  const resultContainer = document.getElementById('import-result-container');
  const btnSubmit = document.getElementById('btn-submit-import');

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Memproses & Memvalidasi Data...';
  }

  const formData = new FormData();
  formData.append('file', file);

  showToast('Memvalidasi & mengimpor data Excel...', 'info');

  try {
    const token = Store.get('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/laporan/import-excel', {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Data Excel berhasil diimpor!', 'success');
      
      if (resultContainer) {
        let errorListHTML = '';
        if (data.errors && data.errors.length > 0) {
          errorListHTML = `
            <div style="margin-top: 16px; padding: 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md);">
              <h4 style="margin: 0 0 8px 0; color: var(--color-danger); font-size: 0.95rem;">Catatan Peringatan / Baris Dilewati:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: var(--color-text);">
                ${data.errors.map(err => `<li style="margin-bottom: 4px;">${err}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        resultContainer.innerHTML = `
          <div style="padding: 20px; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-top: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Ringkasan Hasil Import</h3>
              <span class="badge badge-success" style="font-size: 0.85rem;">Proses Selesai</span>
            </div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 180px; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${data.importedCount || 0}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">Baris Berhasil Diimpor</div>
              </div>
              <div style="flex: 1; min-width: 180px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-danger);">${data.skippedCount || 0}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">Baris Dilewati / Error</div>
              </div>
            </div>
            ${errorListHTML}
          </div>
        `;
      }
    } else {
      showToast(data.message || 'Gagal mengimpor data', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan saat mengunggah file', 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '📥 Validasi & Proses Import Data';
    }
  }
}

export const render = async (container) => {
  if (!Store.isAdmin()) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 64px 24px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🔒</div>
        <h2>Akses Dibatasi</h2>
        <p style="color: var(--color-text-secondary);">Modul Import Data Massal hanya dapat diakses oleh Administrator.</p>
        <a href="#/dashboard" class="btn btn-primary" style="margin-top: 16px;">Kembali ke Dashboard</a>
      </div>
    `;
    return;
  }

  const bulanNama = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const periodeAktif = Store.periodeAktif;
  const periodeText = periodeAktif 
    ? `${bulanNama[periodeAktif.bulan - 1]} ${periodeAktif.tahun}`
    : 'Belum Ada Periode Aktif';

  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Import Data Massal</h1>
          <p class="page-subtitle">Unggah dan migrasikan data rekapitulasi mutu dari file Excel (.xlsx) ke dalam sistem</p>
        </div>
      </div>

      <!-- Card 1: Template & Guidelines -->
      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div>
            <h3 style="margin-top: 0; margin-bottom: 6px;">Format Template Resmi</h3>
            <p style="color: var(--color-text-secondary); margin: 0; font-size: 0.9rem;">
              Unduh template Excel resmi yang telah disesuaikan dengan skema database SIMURS.
            </p>
          </div>
          <button class="btn btn-outline" id="btn-download-template-page">
            📋 Unduh Format Template Import (.xlsx)
          </button>
        </div>
        
        <div style="margin-top: 16px; padding: 14px; background: rgba(59, 130, 246, 0.08); border-left: 4px solid var(--color-primary); border-radius: var(--radius-md); font-size: 0.875rem;">
          <strong>💡 Petunjuk Singkat Pengisian:</strong>
          <ul style="margin: 6px 0 0 0; padding-left: 20px;">
            <li>Format Tanggal wajib: <code>YYYY-MM-DD</code> (contoh: <code>2026-08-01</code>).</li>
            <li>Kolom checklist/pilihan diisi <code>dilakukan</code> / <code>tidak dilakukan</code> atau <code>Ya</code> / <code>Tidak</code>.</li>
            <li>Nama sheet dalam file Excel harus cocok dengan nama modul indikator.</li>
          </ul>
        </div>
      </div>

      <!-- Card 2: File Upload Form -->
      <div class="card" style="padding: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Unggah File Rekap Excel</h3>
        
        <div style="margin-bottom: 20px; padding: 12px 16px; background: var(--color-bg-body); border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.2rem;">📅</span>
          <div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary);">Target Periode Aktif:</div>
            <strong style="color: var(--color-primary); font-size: 1rem;">${periodeText}</strong>
          </div>
        </div>

        <form id="form-import-excel">
          <div class="form-group">
            <label class="form-label">Pilih File Excel (.xlsx)</label>
            <input type="file" id="input-import-file" accept=".xlsx" class="form-control" style="padding: 10px;" required>
          </div>
          
          <button type="submit" class="btn btn-primary" id="btn-submit-import" style="margin-top: 8px;">
            📥 Validasi & Proses Import Data
          </button>
        </form>

        <div id="import-result-container"></div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById('btn-download-template-page').addEventListener('click', downloadTemplateFile);
  document.getElementById('form-import-excel').addEventListener('submit', handleImport);
  applyPeriodLockUI(container);
};

export const destroy = () => {};
