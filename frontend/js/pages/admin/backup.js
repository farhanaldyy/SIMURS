import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showToast } from '../../components/toast.js';

export default { render, destroy };

let containerEl = null;

async function render(container) {
  containerEl = container;
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Backup Database</h1>
          <p class="page-subtitle">Kelola backup & restore database MariaDB</p>
        </div>
        <div style="display:flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <button id="btn-backup-create" class="btn btn-primary">⚡ Backup Sekarang</button>
          <button id="btn-backup-refresh" class="btn btn-outline">🔄 Refresh</button>
          <label id="btn-backup-upload" for="backup-upload-input" class="btn btn-success" style="display:inline-flex; align-items:center; gap:4px; cursor:pointer; margin:0;">
            📤 Upload & Restore
            <input type="file" id="backup-upload-input" accept=".sql" style="display:none;" />
          </label>
        </div>
      </div>

      <div id="backup-status" style="min-height: 0;"></div>

      <div style="margin-bottom: 20px; padding: 12px 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md); font-size: 0.875rem;">
        <strong>⚠️ Peringatan:</strong> Restore database akan <strong>mengganti seluruh data</strong> yang ada saat ini dan <strong>tidak dapat dikembalikan</strong>.
        Pastikan Anda memiliki backup terbaru sebelum melakukan restore.
      </div>

      <div id="backup-table-container">
        <div class="empty-state" style="padding: 40px 24px;">
          <div class="empty-state-icon">⏳</div>
          <p>Memuat daftar backup...</p>
        </div>
      </div>
    </div>
  `;

  containerEl.querySelector('#btn-backup-create').addEventListener('click', createBackup);
  containerEl.querySelector('#btn-backup-refresh').addEventListener('click', loadList);
  const uploadInput = containerEl.querySelector('#backup-upload-input');
  if (uploadInput) {
    uploadInput.addEventListener('change', uploadAndRestore);
  }

  await loadList();
}

function destroy() {
  containerEl = null;
}

async function createBackup() {
  const statusEl = document.getElementById('backup-status');
  const btn = document.getElementById('btn-backup-create');
  btn.disabled = true;
  btn.textContent = '⏳ Membuat backup...';
  statusEl.innerHTML = `
    <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(59, 130, 246, 0.08); border-left: 4px solid var(--color-primary); border-radius: var(--radius-md); font-size: 0.875rem;">
      ⏳ Sedang mengeksport database... ini dapat memakan beberapa saat.
    </div>
  `;
  try {
    const res = await api.post('/backup');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Gagal membuat backup');
    }
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(34, 197, 94, 0.08); border-left: 4px solid var(--color-success); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-success);">
        ✅ Backup berhasil: <strong>${res.data?.filename || ''}</strong>
      </div>
    `;
    showToast('Backup berhasil dibuat', 'success');
    await loadList();
  } catch (err) {
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-danger);">
        ❌ ${err.message || 'Gagal membuat backup'}
      </div>
    `;
    showToast(err.message || 'Gagal membuat backup', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Backup Sekarang';
  }
}

async function loadList() {
  const tableEl = document.getElementById('backup-table-container');
  if (!tableEl) return;
  tableEl.innerHTML = `
    <div class="empty-state" style="padding: 40px 24px;">
      <div class="empty-state-icon">⏳</div>
      <p>Memuat daftar backup...</p>
    </div>
  `;
  try {
    const res = await api.get('/backup');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Gagal memuat daftar backup');
    }
    const columns = [
      { label: 'Nama File', key: 'filename' },
      { label: 'Ukuran', key: 'size', align: 'center', render: (r) => formatSize(r.size) },
      { label: 'Dibuat', key: 'created_at', align: 'center', render: (r) => new Date(r.created_at).toLocaleString('id-ID') },
      {
        label: 'Aksi',
        align: 'center',
        render: (r) => `
          <div style="display:flex; gap:4px; justify-content:center;">
            <button data-dl="${r.filename}" class="btn btn-outline btn-sm">⬇️ Unduh</button>
            <button data-restore="${r.filename}" class="btn btn-warning btn-sm">🔄 Restore</button>
            <button data-del="${r.filename}" class="btn btn-danger btn-sm">🗑️ Hapus</button>
          </div>
        `
      }
    ];
    renderTable('backup-table-container', columns, res.data || []);
    document.querySelectorAll('[data-dl]').forEach(b => b.addEventListener('click', () => download(b.dataset.dl)));
    document.querySelectorAll('[data-restore]').forEach(b => b.addEventListener('click', () => restoreFile(b.dataset.restore)));
    document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => removeFile(b.dataset.del)));
  } catch (err) {
    tableEl.innerHTML = `
      <div style="padding: 20px; margin: 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md); color: var(--color-danger);">
        ❌ ${err.message || 'Gagal memuat daftar'}
      </div>
    `;
  }
}

async function download(filename) {
  try {
    const success = await api.download(`/backup/${encodeURIComponent(filename)}/download`, filename);
    if (success) {
      showToast('File backup berhasil diunduh', 'success');
    }
  } catch (err) {
    showToast('Gagal mengunduh: ' + (err.message || 'error'), 'error');
  }
}

async function restoreFile(filename) {
  const confirmed = confirm(
    `⚠️ PERINGATAN KRITIS!\n\n` +
    `Restore database dari backup "${filename}" akan:\n` +
    `- MENGGANTI seluruh data database saat ini\n` +
    `- Tindakan ini TIDAK DAPAT DIKEMBALIKAN\n\n` +
    `Apakah Anda yakin ingin melanjutkan?`
  );
  if (!confirmed) return;
  
  const doubleConfirmed = confirm(`Konfirmasi kedua:\n\nYakin ingin RESTORE database dari ${filename}?`);
  if (!doubleConfirmed) return;
  
  const statusEl = document.getElementById('backup-status');
  const btns = document.querySelectorAll('#backup-table-container button');
  btns.forEach(b => b.disabled = true);
  statusEl.innerHTML = `
    <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(245, 158, 11, 0.08); border-left: 4px solid var(--color-warning); border-radius: var(--radius-md); font-size: 0.875rem;">
      ⏳ Sedang memulihkan database... ini dapat memakan beberapa saat.
    </div>
  `;
  
  try {
    const res = await api.post(`/backup/restore/${encodeURIComponent(filename)}`);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Gagal memulihkan database');
    }
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(34, 197, 94, 0.08); border-left: 4px solid var(--color-success); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-success);">
        ✅ ${res.message || 'Database berhasil dipulihkan'}
      </div>
    `;
    showToast('Database berhasil dipulihkan', 'success');
    await loadList();
  } catch (err) {
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-danger);">
        ❌ ${err.message || 'Gagal memulihkan database'}
      </div>
    `;
    showToast(err.message || 'Gagal memulihkan database', 'error');
  } finally {
    btns.forEach(b => b.disabled = false);
  }
}

async function uploadAndRestore(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.endsWith('.sql')) {
    alert('Hanya file .sql yang diperbolehkan');
    e.target.value = '';
    return;
  }
  
  const confirmed = confirm(
    `⚠️ PERINGATAN KRITIS!\n\n` +
    `Restore database dari file upload "${file.name}" akan:\n` +
    `- MENGGANTI seluruh data database saat ini\n` +
    `- Tindakan ini TIDAK DAPAT DIKEMBALIKAN\n\n` +
    `Apakah Anda yakin ingin melanjutkan?`
  );
  if (!confirmed) {
    e.target.value = '';
    return;
  }
  
  const doubleConfirmed = confirm(`Konfirmasi kedua:\n\nYakin ingin RESTORE database dari file ini?`);
  if (!doubleConfirmed) {
    e.target.value = '';
    return;
  }
  
  const statusEl = document.getElementById('backup-status');
  const btn = document.getElementById('btn-backup-upload');
  const formData = new FormData();
  formData.append('file', file);
  
  btn.disabled = true;
  statusEl.innerHTML = `
    <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(245, 158, 11, 0.08); border-left: 4px solid var(--color-warning); border-radius: var(--radius-md); font-size: 0.875rem;">
      ⏳ Mengunggah dan memulihkan database... ini dapat memakan beberapa saat.
    </div>
  `;
  
  try {
    const res = await api.upload('/backup/upload-restore', formData);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Gagal memulihkan database');
    }
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(34, 197, 94, 0.08); border-left: 4px solid var(--color-success); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-success);">
        ✅ ${res.message || 'Database berhasil dipulihkan'}
      </div>
    `;
    showToast('Database berhasil dipulihkan', 'success');
    await loadList();
  } catch (err) {
    statusEl.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-danger);">
        ❌ ${err.message || 'Gagal memulihkan database'}
      </div>
    `;
    showToast(err.message || 'Gagal memulihkan database', 'error');
  } finally {
    btn.disabled = false;
    e.target.value = '';
  }
}

async function removeFile(filename) {
  if (!confirm(`Hapus backup ${filename}?`)) return;
  try {
    const res = await api.delete(`/backup/${encodeURIComponent(filename)}`);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Gagal menghapus file');
    }
    showToast('File backup berhasil dihapus', 'success');
    await loadList();
  } catch (err) { showToast('Gagal menghapus: ' + (err.message || 'error'), 'error'); }
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
