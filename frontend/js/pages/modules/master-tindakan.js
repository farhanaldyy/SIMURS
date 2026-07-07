import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { data: [], search: '', page: 1, limit: 10, totalPages: 1 };

async function loadData() {
  const endpoint = `/master-tindakan?page=${state.page}&limit=${state.limit}&search=${encodeURIComponent(state.search)}`;
  const res = await api.get(endpoint);
  if (res.success) {
    state.data = res.data;
    state.totalPages = res.meta.totalPages;
    renderTindakanTable();
    renderPagination();
  } else {
    showToast(res.message || 'Gagal memuat data master tindakan', 'error');
  }
}

function renderTindakanTable() {
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Nama Tindakan', key: 'nama' },
    { 
      label: 'Nilai Tindakan', 
      key: 'nilai', 
      render: (r) => `<strong>${r.nilai}</strong>`
    },
    {
      label: 'Aksi',
      render: (r) => `
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline btn-sm btn-edit-tindakan" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-tindakan" data-id="${r.id}">Hapus</button>
        </div>
      `
    }
  ];

  renderTable('tindakan-table-container', columns, state.data);

  document.querySelectorAll('.btn-edit-tindakan').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = state.data.find(x => x.id == btn.dataset.id);
      if (t) openTindakanModal(t);
    });
  });

  document.querySelectorAll('.btn-delete-tindakan').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteTindakan(parseInt(btn.dataset.id));
    });
  });
}

function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) return;

  if (state.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <div class="pagination" style="display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin-top: 16px;">
      <button class="btn btn-outline btn-sm" id="btn-prev-page" ${state.page === 1 ? 'disabled' : ''}>Prev</button>
      <span style="font-size: 0.9rem; color: var(--color-text-muted);">Halaman ${state.page} dari ${state.totalPages}</span>
      <button class="btn btn-outline btn-sm" id="btn-next-page" ${state.page === state.totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
  container.innerHTML = html;

  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        loadData();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (state.page < state.totalPages) {
        state.page++;
        loadData();
      }
    });
  }
}

function openTindakanModal(tindakan = null) {
  const isEdit = !!tindakan;

  const modalHTML = `
    <form id="tindakan-form">
      <div class="form-group">
        <label class="form-label">Nama Tindakan <span class="required">*</span></label>
        <input type="text" name="nama" class="form-control" value="${tindakan?.nama || ''}" required placeholder="Contoh: Operasi Caesar SC">
      </div>
      <div class="form-group">
        <label class="form-label">Nilai Tindakan <span class="required">*</span></label>
        <input type="number" name="nilai" step="any" class="form-control" value="${tindakan?.nilai !== undefined ? tindakan.nilai : ''}" required placeholder="Contoh: 100 atau 85.5">
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Master Tindakan' : 'Tambah Master Tindakan Baru', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('tindakan-form');
      const formData = Object.fromEntries(new FormData(form));

      // Client-side validations
      const validations = {
        nama: validateRequired(formData.nama, 'Nama Tindakan'),
        nilai: validateRequired(formData.nilai, 'Nilai Tindakan'),
      };

      const errors = validateForm(validations);
      if (errors) { showFormErrors(form, errors); return; }

      // Parse float value
      formData.nilai = parseFloat(formData.nilai);

      if (isEdit) {
        const res = await api.put(`/master-tindakan/${tindakan.id}`, formData);
        if (res.success) {
          showToast('Master tindakan berhasil diupdate', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal mengupdate master tindakan', 'error');
        }
      } else {
        const res = await api.post('/master-tindakan', formData);
        if (res.success) {
          showToast('Master tindakan berhasil ditambahkan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menambahkan master tindakan', 'error');
        }
      }
    }
  });
}

async function handleDeleteTindakan(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus master tindakan ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  const res = await api.delete(`/master-tindakan/${id}`);
  if (res.success) {
    showToast('Master tindakan berhasil dihapus', 'success');
    loadData();
  } else {
    showToast(res.message || 'Gagal menghapus master tindakan', 'error');
  }
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Master Tindakan</h1>
          <p class="page-subtitle">Daftar standardisasi tindakan dan nilainya di SIMURS</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="search-tindakan" class="form-control" placeholder="Cari tindakan..." style="width: 240px;" value="${state.search}">
          <button class="btn btn-primary" id="btn-add-tindakan">+ Tambah Tindakan</button>
        </div>
      </div>
      <div id="tindakan-table-container"></div>
      <div id="pagination-container"></div>
    </div>
  `;

  document.getElementById('btn-add-tindakan').addEventListener('click', () => openTindakanModal());

  const searchInput = document.getElementById('search-tindakan');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value;
      state.page = 1;
      loadData();
    }, 300);
  });

  await loadData();
};

export const destroy = () => {};
