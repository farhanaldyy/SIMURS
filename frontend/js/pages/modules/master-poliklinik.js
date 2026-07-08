import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { data: [], search: '', page: 1, limit: 10, totalPages: 1 };

async function loadData() {
  const endpoint = `/master-poliklinik?page=${state.page}&limit=${state.limit}&search=${encodeURIComponent(state.search)}`;
  const res = await api.get(endpoint);
  if (res.success) {
    state.data = res.data;
    state.totalPages = res.meta.totalPages;
    renderPoliklinikTable();
    renderPagination();
  } else {
    showToast(res.message || 'Gagal memuat data master poliklinik', 'error');
  }
}

function renderPoliklinikTable() {
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Nama Poliklinik', key: 'nama', render: (r) => `<strong>${r.nama}</strong>` },
    { 
      label: 'Status', 
      key: 'aktif', 
      render: (r) => r.aktif 
        ? `<span class="badge badge-success">Aktif</span>` 
        : `<span class="badge badge-danger">Non-Aktif</span>`
    },
    {
      label: 'Aksi',
      render: (r) => `
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline btn-sm btn-edit-poliklinik" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-poliklinik" data-id="${r.id}">Hapus</button>
        </div>
      `
    }
  ];

  renderTable('poliklinik-table-container', columns, state.data);

  document.querySelectorAll('.btn-edit-poliklinik').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = state.data.find(x => x.id == btn.dataset.id);
      if (p) openPoliklinikModal(p);
    });
  });

  document.querySelectorAll('.btn-delete-poliklinik').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeletePoliklinik(parseInt(btn.dataset.id));
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

function openPoliklinikModal(poliklinik = null) {
  const isEdit = !!poliklinik;

  const modalHTML = `
    <form id="poliklinik-form">
      <div class="form-group">
        <label class="form-label">Nama Poliklinik <span class="required">*</span></label>
        <input type="text" name="nama" class="form-control" value="${poliklinik?.nama || ''}" required placeholder="Contoh: Poli Kandungan (Kebidanan)">
      </div>
      <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 16px;">
        <input type="checkbox" name="aktif" id="poli-aktif" ${poliklinik ? (poliklinik.aktif ? 'checked' : '') : 'checked'} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="poli-aktif" style="cursor: pointer; font-weight: 500; font-size: 0.95rem;">Status Aktif</label>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Master Poliklinik' : 'Tambah Master Poliklinik Baru', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('poliklinik-form');
      const formData = {
        nama: form.nama.value,
        aktif: form.aktif.checked
      };

      // Client-side validations
      const validations = {
        nama: validateRequired(formData.nama, 'Nama Poliklinik'),
      };

      const errors = validateForm(validations);
      if (errors) { showFormErrors(form, errors); return; }

      if (isEdit) {
        const res = await api.put(`/master-poliklinik/${poliklinik.id}`, formData);
        if (res.success) {
          showToast('Master poliklinik berhasil diupdate', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal mengupdate master poliklinik', 'error');
        }
      } else {
        const res = await api.post('/master-poliklinik', formData);
        if (res.success) {
          showToast('Master poliklinik berhasil ditambahkan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menambahkan master poliklinik', 'error');
        }
      }
    }
  });
}

async function handleDeletePoliklinik(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus master poliklinik ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  const res = await api.delete(`/master-poliklinik/${id}`);
  if (res.success) {
    showToast('Master poliklinik berhasil dihapus', 'success');
    loadData();
  } else {
    showToast(res.message || 'Gagal menghapus master poliklinik', 'error');
  }
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Master Poliklinik</h1>
          <p class="page-subtitle">Daftar poliklinik rumah sakit untuk pelaporan waktu tunggu</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="search-poliklinik" class="form-control" placeholder="Cari poliklinik..." style="width: 240px;" value="${state.search}">
          <button class="btn btn-primary" id="btn-add-poliklinik">+ Tambah Poliklinik</button>
        </div>
      </div>
      <div id="poliklinik-table-container"></div>
      <div id="pagination-container"></div>
    </div>
  `;

  document.getElementById('btn-add-poliklinik').addEventListener('click', () => openPoliklinikModal());

  const searchInput = document.getElementById('search-poliklinik');
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
