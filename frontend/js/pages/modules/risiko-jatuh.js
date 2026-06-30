// Risiko Jatuh page
import Store from '../../store.js';
import * as api from '../../api/modules/risiko-jatuh.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { validateRequired, validateNoRM, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { data: [], page: 1, limit: 10, total: 0, summary: {} };

export async function render(container) {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Risiko Jatuh</h1>
          <p class="page-subtitle">Pencatatan asesmen risiko jatuh pasien</p>
        </div>
        <button class="btn btn-primary" id="btn-add">+ Tambah Data</button>
      </div>
      <div id="table-container"></div>
      <div id="pagination-container"></div>
      <div class="summary-box" id="summary-container"></div>
    </div>
  `;

  document.getElementById('btn-add').addEventListener('click', () => openFormModal());
  await loadData();
  window.addEventListener('periodeChanged', loadData);
  window.addEventListener('unitChanged', loadData);
}

async function loadData() {
  const params = { page: state.page, limit: state.limit };
  if (Store.periodeAktif) params.periode_id = Store.periodeAktif.id;
  if (Store.unitAktif) params.unit_id = Store.unitAktif.id;

  const [listRes, summaryRes] = await Promise.all([api.getAll(params), api.getSummary(params)]);

  if (listRes.success) {
    state.data = listRes.data;
    state.total = listRes.meta.total;
    renderDataTable();
    renderPagination('pagination-container', state.total, state.page, state.limit, (p) => { state.page = p; loadData(); });
  }

  if (summaryRes.success) {
    state.summary = summaryRes.data;
    renderSummary();
  }
}

function renderDataTable() {
  const dilakukanLabel = (v) => v === 'dilakukan'
    ? '<span class="badge badge-success">Dilakukan</span>'
    : '<span class="badge badge-danger">Tidak</span>';

  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Usia', key: 'usia' },
    { label: 'Asesmen Awal', key: 'asesmen_awal', render: (r) => dilakukanLabel(r.asesmen_awal) },
    { label: 'Asesmen Ulang', key: 'asesmen_ulang', render: (r) => dilakukanLabel(r.asesmen_ulang) },
    { label: 'Intervensi', key: 'intervensi', render: (r) => dilakukanLabel(r.intervensi) },
    { label: 'Edukasi', key: 'edukasi', render: (r) => dilakukanLabel(r.edukasi) },
    { label: 'Aksi', render: (r) => `
      <div class="actions">
        <button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>
        ${Store.canDelete() ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}
      </div>
    `},
  ];

  renderTable('table-container', columns, state.data, {
    rowClass: (r) => {
      const allDone = ['asesmen_awal', 'asesmen_ulang', 'intervensi', 'edukasi'].every(f => r[f] === 'dilakukan');
      return allDone ? '' : 'row-danger';
    }
  });

  // Bind edit/delete buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = state.data.find(d => d.id == btn.dataset.id);
      if (row) openFormModal(row);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(parseInt(btn.dataset.id)));
  });
}

function renderSummary() {
  const s = state.summary;
  const container = document.getElementById('summary-container');
  if (!container) return;
  container.innerHTML = `
    <div class="summary-item"><div class="summary-value">${s.total || 0}</div><div class="summary-label">Total Data</div></div>
    <div class="summary-item"><div class="summary-value">${s.numerator || 0}</div><div class="summary-label">Patuh (N)</div></div>
    <div class="summary-item"><div class="summary-value">${s.persen || 0}%</div><div class="summary-label">Kepatuhan</div></div>
    <div class="summary-item">${renderBadge(s.persen || 0, 100)}<div class="summary-label" style="margin-top:8px">Standar: ${s.standar}</div></div>
  `;
}

function openFormModal(data = null) {
  const isEdit = !!data;
  if (!isEdit) {
    if (!Store.periodeAktif) {
      showToast('Pilih periode terlebih dahulu pada menu di atas sebelum menambahkan data', 'warning');
      return;
    }
    if (!Store.unitAktif && !Store.user.unit_id) {
      showToast('Pilih unit terlebih dahulu pada menu di atas sebelum menambahkan data', 'warning');
      return;
    }
  }
  const dlk = (field, val) => {
    const normalizedVal = val?.replace(/_/g, ' ');
    return `<option value="dilakukan" ${normalizedVal === 'dilakukan' ? 'selected' : ''}>Dilakukan</option>
      <option value="tidak dilakukan" ${normalizedVal === 'tidak dilakukan' ? 'selected' : ''}>Tidak Dilakukan</option>`;
  };

  const formHTML = `
    <form id="modul-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nama Pasien <span class="required">*</span></label>
          <input type="text" name="nama_pasien" class="form-control" value="${data?.nama_pasien || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">No RM <span class="required">*</span></label>
          <input type="text" name="no_rm" class="form-control" value="${data?.no_rm || ''}" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Usia <span class="required">*</span></label>
        <input type="number" name="usia" class="form-control" value="${data?.usia || ''}" min="0" max="150" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Asesmen Awal</label>
          <select name="asesmen_awal" class="form-control">${dlk('asesmen_awal', data?.asesmen_awal)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Asesmen Ulang</label>
          <select name="asesmen_ulang" class="form-control">${dlk('asesmen_ulang', data?.asesmen_ulang)}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Intervensi</label>
          <select name="intervensi" class="form-control">${dlk('intervensi', data?.intervensi)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Edukasi</label>
          <select name="edukasi" class="form-control">${dlk('edukasi', data?.edukasi)}</select>
        </div>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Risiko Jatuh' : 'Tambah Risiko Jatuh', formHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('modul-form');
      const formData = Object.fromEntries(new FormData(form));

      const errors = validateForm({
        nama_pasien: validateRequired(formData.nama_pasien, 'Nama Pasien'),
        no_rm: validateNoRM(formData.no_rm),
        usia: validateRequired(formData.usia, 'Usia'),
      });

      if (errors) { showFormErrors(form, errors); return; }

      formData.usia = parseInt(formData.usia);
      if (!isEdit) {
        if (Store.periodeAktif) formData.periode_id = Store.periodeAktif.id;
        if (Store.unitAktif) formData.unit_id = Store.unitAktif.id;
        else if (Store.user.unit_id) formData.unit_id = Store.user.unit_id;
      }

      const res = isEdit ? await api.update(data.id, formData) : await api.create(formData);
      if (res.success) {
        showToast(isEdit ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan', 'success');
        closeModal();
        loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan', 'error');
      }
    },
  });
}

async function handleDelete(id) {
  if (!confirm('Yakin ingin menghapus data ini?')) return;
  const res = await api.remove(id);
  if (res.success) {
    showToast('Data berhasil dihapus', 'success');
    loadData();
  } else {
    showToast(res.message || 'Gagal menghapus', 'error');
  }
}

export function destroy() {
  window.removeEventListener('periodeChanged', loadData);
  window.removeEventListener('unitChanged', loadData);
}
