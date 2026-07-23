// Insiden Keselamatan page
import Store from '../../store.js';
import * as api from '../../api/modules/insiden-keselamatan.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';
import { formatDate, formatTime } from '../../utils/formatter.js';

let state = { data: [], page: 1, limit: 10, total: 0, summary: {}, summaryData: null };

export async function render(container) {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div><h1 class="page-title">Insiden Keselamatan Pasien</h1><p class="page-subtitle">Pencatatan insiden keselamatan pasien</p></div>
        <button class="btn btn-primary" id="btn-add">+ Tambah Data</button>
      </div>
      <div id="summary-data-container"></div>
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

  const promises = [
    api.getAll(params),
    api.getSummary(params)
  ];

  if (Store.periodeAktif) {
    const summaryParams = { periode_id: Store.periodeAktif.id };
    if (Store.unitAktif) summaryParams.unit_id = Store.unitAktif.id;
    promises.push(api.getSummaryData(summaryParams));
  }

  const results = await Promise.all(promises);
  const listRes = results[0];
  const summaryRes = results[1];
  const summaryDataRes = results[2];

  if (listRes.success) {
    state.data = listRes.data;
    state.total = listRes.meta.total;
    renderDataTable();
    renderPagination('pagination-container', state.total, state.page, state.limit, (p) => {
      state.page = p;
      loadData();
    });
  }

  if (summaryRes.success) {
    state.summary = summaryRes.data;
    renderSummary();
  }

  if (summaryDataRes && summaryDataRes.success) {
    state.summaryData = summaryDataRes.data;
    renderSummaryDataCard();
  }
}

function renderSummaryDataCard() {
  const container = document.getElementById('summary-data-container');
  if (!container || !state.summaryData) return;

  const totalPasien = state.summaryData.total_pasien !== undefined ? state.summaryData.total_pasien : 0;

  container.innerHTML = `
    <div class="summary-data-compact-card">
      <div class="card-main-row">
        <div style="display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-text);">📋 Parameter Populasi Pasien</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1rem; color: var(--color-primary);">⚙️</span>
            <span style="color: var(--color-text-secondary); font-weight: 500; font-size: 0.85rem;">Total Data Pasien:</span>
            <span style="font-weight: 700; font-size: 1rem; color: var(--color-text);">${totalPasien} Pasien</span>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-edit-summary-data" style="padding: 4px 10px; font-size: 0.8rem;">Edit Parameter</button>
      </div>
      <div class="card-info-row">
        ℹ️ Masukkan total populasi/jumlah data seluruh pasien yang dirawat atau dilayani pada periode & unit ini sebagai denominator (D) rasio insiden keselamatan pasien.
      </div>
    </div>
  `;

  document.getElementById('btn-edit-summary-data').addEventListener('click', openSummaryDataModal);
}

function openSummaryDataModal() {
  const currentVal = state.summaryData?.total_pasien !== undefined ? state.summaryData.total_pasien : 0;
  showModal('Update Parameter Total Data Pasien', `
    <form id="summary-data-form">
      <div class="form-group">
        <label class="form-label">Total Data Pasien (Pasien) <span class="required">*</span></label>
        <input type="number" name="total_pasien" class="form-control" value="${currentVal}" min="0" required>
      </div>
    </form>
  `, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('summary-data-form');
      const formData = Object.fromEntries(new FormData(form));
      const totalPasien = parseInt(formData.total_pasien || 0);

      const payload = {
        periode_id: Store.periodeAktif.id,
        total_pasien: totalPasien
      };
      if (Store.unitAktif) payload.unit_id = Store.unitAktif.id;
      else if (Store.user && Store.user.unit_id) payload.unit_id = Store.user.unit_id;

      const res = await api.upsertSummaryData(payload);
      if (res.success) {
        showToast('Parameter berhasil disimpan', 'success');
        closeModal();
        loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan', 'error');
      }
    }
  });
}

function renderDataTable() {
  const jenisColors = { KTD: 'badge-danger', KNC: 'badge-warning', KPC: 'badge-info', Sentinel: 'badge-danger', KTC: 'badge-primary' };
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Tanggal', render: (r) => formatDate(r.tanggal_kejadian) },
    { label: 'Jam', render: (r) => formatTime(r.jam_kejadian) },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Jenis', render: (r) => `<span class="badge ${jenisColors[r.jenis_insiden] || 'badge-info'}">${r.jenis_insiden}</span>` },
    { label: 'Deskripsi', render: (r) => `<span title="${r.deskripsi_insiden}">${(r.deskripsi_insiden || '').substring(0, 40)}...</span>` },
    { label: 'Aksi', render: (r) => `<div class="actions"><button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>${Store.canDelete() ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}</div>` },
  ];
  renderTable('table-container', columns, state.data);
  document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => { const row = state.data.find(d => d.id == b.dataset.id); if (row) openFormModal(row); }));
  document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => handleDelete(parseInt(b.dataset.id))));
}

function renderSummary() {
  const s = state.summary;
  const container = document.getElementById('summary-container');
  if (!container) return;
  const byJenis = s.byJenis || {};
  const denominator = s.denominator !== undefined ? s.denominator : 0;

  container.innerHTML = `
    <div class="summary-item"><div class="summary-value">${s.total || 0}</div><div class="summary-label">Total Insiden</div></div>
    <div class="summary-item"><div class="summary-value">${byJenis.KTD || 0}</div><div class="summary-label">KTD</div></div>
    <div class="summary-item"><div class="summary-value">${byJenis.KNC || 0}</div><div class="summary-label">KNC</div></div>
    <div class="summary-item"><div class="summary-value">${byJenis.Sentinel || 0}</div><div class="summary-label">Sentinel</div></div>
    <div class="summary-item"><div class="summary-value">${denominator}</div><div class="summary-label">Total Pasien (D)</div></div>
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
  let insidenHour = '08', insidenMin = '00';
  if (data?.jam_kejadian) {
    const timeVal = formatTime(data.jam_kejadian);
    if (timeVal && timeVal.includes(':')) {
      const parts = timeVal.split(':');
      insidenHour = parts[0].padStart(2, '0');
      insidenMin = parts[1].padStart(2, '0');
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const hourSelect = `<select id="insiden-hour" class="form-control" style="width: 75px; display: inline-block;">
    ${hours.map(h => `<option value="${h}" ${h === insidenHour ? 'selected' : ''}>${h}</option>`).join('')}
  </select>`;

  const minSelect = `<select id="insiden-min" class="form-control" style="width: 75px; display: inline-block;">
    ${minutes.map(m => `<option value="${m}" ${m === insidenMin ? 'selected' : ''}>${m}</option>`).join('')}
  </select>`;

  const jenisList = ['KTD', 'KNC', 'KPC', 'Sentinel', 'KTC'];
  const formHTML = `
    <form id="modul-form">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Tanggal Kejadian <span class="required">*</span></label><input type="date" name="tanggal_kejadian" class="form-control" value="${data?.tanggal_kejadian?.substring(0, 10) || ''}"></div>
        <div class="form-group">
          <label class="form-label">Jam Kejadian <span class="required">*</span></label>
          <div style="display: flex; align-items: center; gap: 4px;">
            ${hourSelect}
            <span>:</span>
            ${minSelect}
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nama Pasien <span class="required">*</span></label><input type="text" name="nama_pasien" class="form-control" value="${data?.nama_pasien || ''}"></div>
        <div class="form-group"><label class="form-label">No RM <span class="required">*</span></label><input type="text" name="no_rm" class="form-control" value="${data?.no_rm || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Jenis Insiden <span class="required">*</span></label><select name="jenis_insiden" class="form-control">${jenisList.map(j => `<option value="${j}" ${data?.jenis_insiden === j ? 'selected' : ''}>${j}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Deskripsi <span class="required">*</span></label><textarea name="deskripsi_insiden" class="form-control">${data?.deskripsi_insiden || ''}</textarea></div>
    </form>`;
  showModal(isEdit ? 'Edit Insiden' : 'Tambah Insiden', formHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('modul-form');
      const fd = Object.fromEntries(new FormData(form));
      const hour = document.getElementById('insiden-hour')?.value || '08';
      const min = document.getElementById('insiden-min')?.value || '00';
      fd.jam_kejadian = `${hour}:${min}`;
      const errors = validateForm({ nama_pasien: validateRequired(fd.nama_pasien, 'Nama'), no_rm: validateRequired(fd.no_rm, 'No RM'), tanggal_kejadian: validateRequired(fd.tanggal_kejadian, 'Tanggal'), deskripsi_insiden: validateRequired(fd.deskripsi_insiden, 'Deskripsi') });
      if (errors) { showFormErrors(form, errors); return; }
      if (!isEdit) { if (Store.periodeAktif) fd.periode_id = Store.periodeAktif.id; if (Store.unitAktif) fd.unit_id = Store.unitAktif.id; else if (Store.user.unit_id) fd.unit_id = Store.user.unit_id; }
      const res = isEdit ? await api.update(data.id, fd) : await api.create(fd);
      if (res.success) { showToast('Data berhasil disimpan', 'success'); closeModal(); loadData(); } else { showToast(res.message || 'Gagal', 'error'); }
    },
  });
}

async function handleDelete(id) {
  if (!confirm('Yakin?')) return;
  const res = await api.remove(id);
  if (res.success) { showToast('Dihapus', 'success'); loadData(); } else { showToast(res.message, 'error'); }
}

export function destroy() { window.removeEventListener('periodeChanged', loadData); window.removeEventListener('unitChanged', loadData); }
