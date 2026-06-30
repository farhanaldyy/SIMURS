// Alur Klinis page
import Store from '../../store.js';
import * as api from '../../api/modules/alur-klinis.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { data: [], page: 1, limit: 10, total: 0, summary: {} };

export async function render(container) {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header"><div><h1 class="page-title">Alur Klinis</h1><p class="page-subtitle">Kepatuhan clinical pathway (LOS, penunjang, obat)</p></div><button class="btn btn-primary" id="btn-add">+ Tambah Data</button></div>
      <div id="table-container"></div><div id="pagination-container"></div><div class="summary-box" id="summary-container"></div>
    </div>`;
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
  if (listRes.success) { state.data = listRes.data; state.total = listRes.meta.total; renderDataTable(); renderPagination('pagination-container', state.total, state.page, state.limit, (p) => { state.page = p; loadData(); }); }
  if (summaryRes.success) { state.summary = summaryRes.data; renderSummary(); }
}

function sesuaiLabel(v) {
  return v === 'sesuai' ? '<span class="badge badge-success">Sesuai</span>' : '<span class="badge badge-danger">Tidak</span>';
}

function renderDataTable() {
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Diagnosis', key: 'diagnosis' },
    { label: 'Ruangan', key: 'ruangan' },
    { label: 'LOS', render: (r) => sesuaiLabel(r.los) },
    { label: 'Penunjang', render: (r) => sesuaiLabel(r.penunjang) },
    { label: 'Obat', render: (r) => sesuaiLabel(r.obat) },
    { label: 'Aksi', render: (r) => `<div class="actions"><button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>${Store.canDelete() ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}</div>` },
  ];
  renderTable('table-container', columns, state.data, { rowClass: (r) => (r.los === 'sesuai' && r.penunjang === 'sesuai' && r.obat === 'sesuai') ? '' : 'row-danger' });
  document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => { const row = state.data.find(d => d.id == b.dataset.id); if (row) openFormModal(row); }));
  document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => handleDelete(parseInt(b.dataset.id))));
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

  let activeUnit = Store.unitAktif;
  if (!activeUnit && Store.user && Store.user.unit_id && Store.unitList) {
    activeUnit = Store.unitList.find(u => u.id === Store.user.unit_id);
  }
  const defaultRuangan = data?.ruangan || (activeUnit ? activeUnit.nama_unit : '');

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  let defaultBulan = data?.bulan;
  if (!defaultBulan && Store.periodeAktif) {
    defaultBulan = namaBulan[Store.periodeAktif.bulan - 1];
  }

  const bulanOptions = namaBulan.map(b => `
    <option value="${b}" ${defaultBulan === b ? 'selected' : ''}>${b}</option>
  `).join('');

  const sOpts = (val) => `<option value="sesuai" ${val === 'sesuai' ? 'selected' : ''}>Sesuai</option><option value="tidak_sesuai" ${val === 'tidak_sesuai' ? 'selected' : ''}>Tidak Sesuai</option>`;
  
  const formHTML = `
    <form id="modul-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nama Pasien <span class="required">*</span></label>
          <input type="text" name="nama_pasien" class="form-control" value="${data?.nama_pasien || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">No RM <span class="required">*</span></label>
          <input type="text" name="no_rm" class="form-control" value="${data?.no_rm || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Diagnosis <span class="required">*</span></label>
          <input type="text" name="diagnosis" class="form-control" value="${data?.diagnosis || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Ruangan <span class="required">*</span></label>
          <input type="text" name="ruangan" class="form-control" value="${defaultRuangan}" readonly style="background-color: #f1f5f9; cursor: not-allowed;">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Bulan <span class="required">*</span></label>
        <select name="bulan" class="form-control" required>
          <option value="" disabled ${!defaultBulan ? 'selected' : ''}>-- Pilih Bulan --</option>
          ${bulanOptions}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">LOS</label>
          <select name="los" class="form-control">${sOpts(data?.los)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Penunjang</label>
          <select name="penunjang" class="form-control">${sOpts(data?.penunjang)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Obat</label>
          <select name="obat" class="form-control">${sOpts(data?.obat)}</select>
        </div>
      </div>
    </form>`;

  showModal(isEdit ? 'Edit' : 'Tambah', formHTML, { confirmText: 'Simpan', onConfirm: async () => {
    const form = document.getElementById('modul-form'); 
    const fd = Object.fromEntries(new FormData(form));
    const errors = validateForm({ 
      nama_pasien: validateRequired(fd.nama_pasien, 'Nama Pasien'), 
      no_rm: validateRequired(fd.no_rm, 'No RM'), 
      diagnosis: validateRequired(fd.diagnosis, 'Diagnosis'), 
      ruangan: validateRequired(fd.ruangan, 'Ruangan'),
      bulan: validateRequired(fd.bulan, 'Bulan')
    });
    if (errors) { showFormErrors(form, errors); return; }
    if (!isEdit) { 
      if (Store.periodeAktif) fd.periode_id = Store.periodeAktif.id; 
      if (Store.unitAktif) fd.unit_id = Store.unitAktif.id; 
      else if (Store.user.unit_id) fd.unit_id = Store.user.unit_id; 
    }
    const res = isEdit ? await api.update(data.id, fd) : await api.create(fd);
    if (res.success) { showToast('Berhasil', 'success'); closeModal(); loadData(); } else { showToast(res.message, 'error'); }
  }});
}

async function handleDelete(id) { if (!confirm('Yakin?')) return; const r = await api.remove(id); if (r.success) { showToast('Dihapus', 'success'); loadData(); } else showToast(r.message, 'error'); }
export function destroy() { window.removeEventListener('periodeChanged', loadData); window.removeEventListener('unitChanged', loadData); }
