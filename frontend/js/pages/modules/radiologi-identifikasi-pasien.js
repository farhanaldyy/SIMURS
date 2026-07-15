import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';
import { formatDate } from '../../utils/formatter.js';

let state = { data: [], page: 1, limit: 10, total: 0, summary: {} };
const OPTS = ['dilakukan', 'tidak dilakukan', 'tidak ada peluang'];

export async function render(container) {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kepatuhan Identifikasi Pasien</h1>
          <p class="page-subtitle">Kepatuhan identifikasi pasien radiologi sebelum tindakan</p>
        </div>
        <button class="btn btn-primary" id="btn-add">+ Tambah Data</button>
      </div>
      <div id="table-container"></div>
      <div id="pagination-container"></div>
      <div class="summary-box" id="summary-container"></div>
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
  
  const [listRes, summaryRes] = await Promise.all([
    api.get('/radiologi-identifikasi-pasien', params),
    api.get('/radiologi-identifikasi-pasien/summary', params)
  ]);
  
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
}

function idLabel(v) {
  if (v === 'dilakukan') return '<span class="badge badge-success">✓</span>';
  if (v === 'tidak dilakukan' || v === 'tidak_dilakukan') return '<span class="badge badge-danger">✕</span>';
  return '<span class="badge badge-info">N/A</span>';
}

function renderDataTable() {
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Tanggal', render: (r) => formatDate(r.tanggal) },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Obat', render: (r) => idLabel(r.pemberian_obat) },
    { label: 'Nutrisi', render: (r) => idLabel(r.pemberian_nutrisi) },
    { label: 'Darah', render: (r) => idLabel(r.pemberian_darah) },
    { label: 'Spesimen', render: (r) => idLabel(r.pengambilan_spesimen) },
    { label: 'Tindakan', render: (r) => idLabel(r.melakukan_tindakan) },
    { 
      label: 'Aksi', 
      render: (r) => `
        <div class="actions">
          <button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>
          ${Store.canDelete() ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}
        </div>` 
    },
  ];
  renderTable('table-container', columns, state.data);
  document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => { 
    const row = state.data.find(d => d.id == b.dataset.id); 
    if (row) openFormModal(row); 
  }));
  document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => handleDelete(parseInt(b.dataset.id))));
}

function renderSummary() {
  const s = state.summary;
  const container = document.getElementById('summary-container');
  if (!container) return;
  container.innerHTML = `
    <div class="summary-item"><div class="summary-value">${s.total || 0}</div><div class="summary-label">Total Data</div></div>
    <div class="summary-item"><div class="summary-value">${s.numerator || 0}/${s.denominator || 0}</div><div class="summary-label">Numerator/Denominator</div></div>
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
  const selOpts = (val) => {
    const normalizedVal = val?.replace(/_/g, ' ');
    return OPTS.map(o => `<option value="${o}" ${normalizedVal === o ? 'selected' : ''}>${o}</option>`).join('');
  };
  
  const formHTML = `
    <form id="modul-form">
      <div class="form-group">
        <label class="form-label">Tanggal <span class="required">*</span></label>
        <input type="date" name="tanggal" class="form-control" value="${data?.tanggal?.substring(0, 10) || ''}">
      </div>
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
          <label class="form-label">Pemberian Obat</label>
          <select name="pemberian_obat" class="form-control">${selOpts(data?.pemberian_obat)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Pemberian Nutrisi</label>
          <select name="pemberian_nutrisi" class="form-control">${selOpts(data?.pemberian_nutrisi)}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Pemberian Darah</label>
          <select name="pemberian_darah" class="form-control">${selOpts(data?.pemberian_darah)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Pengambilan Spesimen</label>
          <select name="pengambilan_spesimen" class="form-control">${selOpts(data?.pengambilan_spesimen)}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Melakukan Tindakan</label>
          <select name="melakukan_tindakan" class="form-control">${selOpts(data?.melakukan_tindakan)}</select>
        </div>
      </div>
    </form>`;
    
  showModal(isEdit ? 'Edit' : 'Tambah', formHTML, { 
    confirmText: 'Simpan', 
    onConfirm: async () => {
      const form = document.getElementById('modul-form'); 
      const fd = Object.fromEntries(new FormData(form));
      const errors = validateForm({ 
        nama_pasien: validateRequired(fd.nama_pasien, 'Nama'), 
        no_rm: validateRequired(fd.no_rm, 'No RM'), 
        tanggal: validateRequired(fd.tanggal, 'Tanggal') 
      });
      if (errors) { showFormErrors(form, errors); return; }
      if (!isEdit) { 
        if (Store.periodeAktif) fd.periode_id = Store.periodeAktif.id; 
        if (Store.unitAktif) fd.unit_id = Store.unitAktif.id; 
        else if (Store.user.unit_id) fd.unit_id = Store.user.unit_id; 
      }
      
      const res = isEdit ? await api.put(`/radiologi-identifikasi-pasien/${data.id}`, fd) : await api.post('/radiologi-identifikasi-pasien', fd);
      if (res.success) { 
        showToast('Berhasil', 'success'); 
        closeModal(); 
        loadData(); 
      } else { 
        showToast(res.message, 'error'); 
      }
    }
  });
}

async function handleDelete(id) { 
  if (!confirm('Yakin?')) return; 
  const r = await api.delete(`/radiologi-identifikasi-pasien/${id}`); 
  if (r.success) { 
    showToast('Dihapus', 'success'); 
    loadData(); 
  } else {
    showToast(r.message, 'error'); 
  }
}

export function destroy() { 
  window.removeEventListener('periodeChanged', loadData); 
  window.removeEventListener('unitChanged', loadData); 
}
