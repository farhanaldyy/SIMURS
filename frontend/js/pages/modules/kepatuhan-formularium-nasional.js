import Store from '../../store.js';
import { api } from '../../api/client.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = {
  records: [],
  obatDiluarFornasRecords: []
};

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatPeriod(periodId) {
  const p = Store.periodeList?.find(x => x.id === periodId);
  if (!p) return `Periode ID: ${periodId}`;
  return `${monthNames[p.bulan]} ${p.tahun}`;
}

async function loadData() {
  const activePeriodId = Store.periodeAktif?.id;
  const tableBody = document.getElementById('table-body-fornas');
  if (!tableBody) return;

  if (!activePeriodId) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Pilih periode di bagian atas terlebih dahulu.</td></tr>`;
    return;
  }

  const res = await api.get(`/kepatuhan-fornas?periode_id=${activePeriodId}`);
  if (res.success) {
    state.records = res.data;
  } else {
    state.records = [];
  }

  const resExceptions = await api.get(`/kepatuhan-fornas/obat-diluar-fornas?periode_id=${activePeriodId}`);
  if (resExceptions.success) {
    state.obatDiluarFornasRecords = resExceptions.data;
  } else {
    state.obatDiluarFornasRecords = [];
  }

  renderSummary();
  renderTable();
  renderExceptionsTable();
}

function renderSummary() {
  const summaryContainer = document.getElementById('summary-bar-fornas');
  if (!summaryContainer) return;

  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : '-';
  const record = state.records.find(r => r.periode_id === Store.periodeAktif?.id);

  if (!record) {
    summaryContainer.innerHTML = `
      <div style="background: var(--bg-light); border-left: 4px solid var(--color-warning); padding: 12px 16px; border-radius: 4px; font-size: 0.95rem;">
        <span style="font-weight: 600;">Belum ada data untuk periode aktif (${activePeriodName}).</span> Silakan klik tombol di kanan atas untuk menginput data.
      </div>
    `;
    return;
  }

  const v1 = record.val1;
  const v2 = record.val2;
  const compliance = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
  const isTargetAchieved = parseFloat(compliance) === 100;
  const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
  const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

  summaryContainer.innerHTML = `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
      <div style="flex: 1; min-width: 150px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Capaian (${activePeriodName})</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${compliance}%</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Total Resep (D)</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${v1}</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Resep Sesuai Fornas (N)</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${v2}</div>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
      </div>
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById('table-body-fornas');
  if (!container) return;

  if (state.records.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data bulanan untuk periode aktif ini.</td>
      </tr>
    `;
    return;
  }

  const canDelete = Store.canDelete();
  container.innerHTML = state.records.map(r => {
    const v1 = r.val1;
    const v2 = r.val2;
    const compliance = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
    const isTargetAchieved = parseFloat(compliance) === 100;

    return `
      <tr>
        <td><strong>${formatPeriod(r.periode_id)}</strong></td>
        <td style="text-align: center;">${v1}</td>
        <td style="text-align: center;">${v2}</td>
        <td style="text-align: center; font-weight: bold; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${compliance}%</td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = state.records.find(x => x.id == btn.dataset.id);
      if (rec) openInputModal(rec);
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDelete(parseInt(btn.dataset.id));
    });
  });
}

function renderExceptionsTable() {
  const container = document.getElementById('table-body-obat-fornas');
  if (!container) return;

  if (state.obatDiluarFornasRecords.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data resep diluar Fornas.</td>
      </tr>
    `;
    return;
  }

  const canDelete = Store.canDelete();
  container.innerHTML = state.obatDiluarFornasRecords.map(r => {
    let obatList = [];
    try {
      obatList = JSON.parse(r.obat);
    } catch (e) {
      obatList = [r.obat];
    }
    const obatTags = obatList.map(o => `<span class="badge badge-outline" style="margin-right: 4px; margin-bottom: 4px;">${o}</span>`).join('');

    return `
      <tr>
        <td><strong>${r.nama_dokter}</strong></td>
        <td><div style="display: flex; flex-wrap: wrap;">${obatTags}</div></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit-exception" data-id="${r.id}">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-exception" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.querySelectorAll('.btn-edit-exception').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = state.obatDiluarFornasRecords.find(x => x.id == btn.dataset.id);
      if (rec) openObatDiluarFornasModal(rec);
    });
  });

  container.querySelectorAll('.btn-delete-exception').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteException(parseInt(btn.dataset.id));
    });
  });
}

function openInputModal(record = null) {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    showToast('Pilih periode pelaporan di bagian atas terlebih dahulu', 'warning');
    return;
  }

  const isEdit = !!record;

  const modalHTML = `
    <form id="fornas-form">
      <input type="hidden" name="id" value="${record ? record.id : ''}">
      <div class="form-group">
        <label class="form-label">Total Resep (D) <span class="required">*</span></label>
        <input type="number" name="val1" class="form-control" value="${record ? record.val1 : 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Resep Sesuai Fornas (N) <span class="required">*</span></label>
        <input type="number" name="val2" class="form-control" value="${record ? record.val2 : 0}" min="0" required>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Data Kepatuhan Fornas' : 'Input Data Kepatuhan Fornas', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('fornas-form');
      const formData = Object.fromEntries(new FormData(form));

      const payload = {
        id: formData.id ? parseInt(formData.id) : undefined,
        periode_id: activePeriodId,
        val1: parseInt(formData.val1 || 0),
        val2: parseInt(formData.val2 || 0)
      };

      const res = await api.post('/kepatuhan-fornas', payload);
      if (res.success) {
        showToast('Data berhasil disimpan', 'success');
        closeModal();
        await loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan data', 'error');
      }
    }
  });
}

function openObatDiluarFornasModal(record = null) {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    showToast('Pilih periode pelaporan di bagian atas terlebih dahulu', 'warning');
    return;
  }

  const isEdit = !!record;
  let obatList = [''];
  if (record) {
    try {
      obatList = JSON.parse(record.obat);
    } catch (e) {
      obatList = [record.obat];
    }
  }

  const modalHTML = `
    <form id="obat-fornas-form">
      <input type="hidden" name="id" value="${record ? record.id : ''}">
      <div class="form-group">
        <label class="form-label">Nama Dokter <span class="required">*</span></label>
        <input type="text" name="nama_dokter" class="form-control" value="${record ? record.nama_dokter : ''}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Daftar Obat Diluar Fornas <span class="required">*</span></label>
        <div id="obat-inputs-container" style="display: flex; flex-direction: column; gap: 8px;">
          ${obatList.map((o, idx) => `
            <div class="obat-input-row" style="display: flex; gap: 8px; align-items: center;">
              <input type="text" name="obat[]" class="form-control obat-item-input" value="${o}" placeholder="Nama Obat" required>
              ${idx > 0 ? `<button type="button" class="btn btn-danger btn-sm btn-remove-obat-row" style="padding: 8px 12px;">✕</button>` : '<div style="width: 32px;"></div>'}
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-outline btn-sm btn-add-obat-row" style="margin-top: 8px;">+ Tambah Obat</button>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Resep Diluar Fornas' : 'Tambah Resep Diluar Fornas', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('obat-fornas-form');
      const namaDokter = form.querySelector('[name="nama_dokter"]').value;
      const id = form.querySelector('[name="id"]').value;

      const obatInputs = form.querySelectorAll('.obat-item-input');
      const obat = Array.from(obatInputs).map(inp => inp.value.trim()).filter(val => val !== '');

      if (!namaDokter) {
        showToast('Nama dokter wajib diisi', 'error');
        return;
      }
      if (obat.length === 0) {
        showToast('Daftar obat wajib diisi minimal satu', 'error');
        return;
      }

      const payload = {
        id: id ? parseInt(id) : undefined,
        periode_id: activePeriodId,
        nama_dokter: namaDokter,
        obat: obat
      };

      const res = await api.post('/kepatuhan-fornas/obat-diluar-fornas', payload);
      if (res.success) {
        showToast('Resep diluar Fornas berhasil disimpan', 'success');
        closeModal();
        await loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan resep', 'error');
      }
    }
  });

  const container = document.getElementById('obat-inputs-container');
  const btnAdd = document.querySelector('.btn-add-obat-row');

  btnAdd.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'obat-input-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    row.style.marginTop = '8px';
    row.innerHTML = `
      <input type="text" name="obat[]" class="form-control obat-item-input" placeholder="Nama Obat" required>
      <button type="button" class="btn btn-danger btn-sm btn-remove-obat-row" style="padding: 8px 12px;">✕</button>
    `;
    container.appendChild(row);

    row.querySelector('.btn-remove-obat-row').addEventListener('click', () => {
      row.remove();
    });
  });

  document.querySelectorAll('.btn-remove-obat-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.obat-input-row').remove();
    });
  });
}

async function handleDelete(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

  const res = await api.delete(`/kepatuhan-fornas/${id}`);
  if (res.success) {
    showToast('Data berhasil dihapus', 'success');
    await loadData();
  } else {
    showToast(res.message || 'Gagal menghapus data', 'error');
  }
}

async function handleDeleteException(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus resep di luar Fornas ini?')) return;

  const res = await api.delete(`/kepatuhan-fornas/obat-diluar-fornas/${id}`);
  if (res.success) {
    showToast('Resep di luar Fornas berhasil dihapus', 'success');
    await loadData();
  } else {
    showToast(res.message || 'Gagal menghapus resep', 'error');
  }
}

export default {
  render: async (container) => {
    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Kepatuhan Penggunaan Formularium Nasional</h3>
              <span class="badge badge-outline" style="margin-top: 4px; display: inline-block;">Target: 100%</span>
            </div>
            <button class="btn btn-primary btn-add">+ Input / Edit Data Bulan Ini</button>
          </div>

          <div id="summary-bar-fornas" style="margin-bottom: 20px;"></div>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bulan / Periode</th>
                  <th style="text-align: center;">Total Resep (D)</th>
                  <th style="text-align: center;">Resep Sesuai Fornas (N)</th>
                  <th style="text-align: center;">Persentase (%)</th>
                  <th style="text-align: center; width: 100px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-body-fornas">
                <tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Section Obat di Luar Fornas -->
          <div style="margin-top: 32px; border-top: 1px solid var(--border-color); padding-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h4 style="margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--text-primary);">Preskripsi Obat Diluar Formularium Nasional</h4>
                <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-light);">Daftar resep obat dokter yang tidak sesuai dengan Formularium Nasional</p>
              </div>
              <button class="btn btn-outline btn-add-obat-fornas">+ Tambah Resep Luar Fornas</button>
            </div>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nama Dokter</th>
                    <th>Daftar Obat Diluar Fornas</th>
                    <th style="text-align: center; width: 100px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="table-body-obat-fornas">
                  <tr><td colspan="3" style="text-align: center; color: var(--color-muted);">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    `;

    container.querySelector('.btn-add').addEventListener('click', () => openInputModal());
    container.querySelector('.btn-add-obat-fornas').addEventListener('click', () => openObatDiluarFornasModal());

    // Listen for global period changes
    window.addEventListener('periodChanged', loadData);

    await loadData();
  },

  destroy: () => {
    window.removeEventListener('periodChanged', loadData);
  }
};
