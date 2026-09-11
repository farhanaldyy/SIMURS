import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { data: [], search: '', page: 1, limit: 10, totalPages: 1 };

async function loadData() {
  const endpoint = `/master-dokter?page=${state.page}&limit=${state.limit}&search=${encodeURIComponent(state.search)}`;
  const res = await api.get(endpoint);
  if (res.success) {
    state.data = res.data;
    state.totalPages = res.meta.totalPages;
    renderDokterTable();
    renderPagination();
  } else {
    showToast(res.message || 'Gagal memuat data master dokter', 'error');
  }
}

function renderDokterTable() {
  const columns = [
    { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
    { label: 'Nama Dokter', key: 'nama', render: (r) => `<strong>${r.nama}</strong>` },
    { label: 'Spesialisasi', key: 'spesialisasi', render: (r) => r.spesialisasi || '<span class="text-muted">-</span>' },
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
          <button class="btn btn-outline btn-sm btn-edit-dokter" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-dokter" data-id="${r.id}">Hapus</button>
        </div>
      `
    }
  ];

  renderTable('dokter-table-container', columns, state.data);

  document.querySelectorAll('.btn-edit-dokter').forEach(btn => {
    btn.addEventListener('click', () => {
      const dokter = state.data.find(x => x.id == btn.dataset.id);
      if (dokter) openDokterModal(dokter);
    });
  });

  document.querySelectorAll('.btn-delete-dokter').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteDokter(parseInt(btn.dataset.id));
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

function openDokterModal(dokter = null) {
  const isEdit = !!dokter;

  const modalHTML = `
    <form id="dokter-form">
      <div class="form-group">
        <label class="form-label">Nama Dokter <span class="required">*</span></label>
        <input type="text" name="nama" class="form-control" value="${dokter?.nama || ''}" required placeholder="Contoh: dr. Ahmad, Sp.PD">
      </div>
      <div class="form-group" style="margin-top: 16px;">
        <label class="form-label">Spesialisasi</label>
        <input type="text" name="spesialisasi" class="form-control" value="${dokter?.spesialisasi || ''}" placeholder="Contoh: Spesialis Penyakit Dalam / Dokter Umum">
      </div>
      <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 16px;">
        <input type="checkbox" name="aktif" id="dokter-aktif" ${dokter ? (dokter.aktif ? 'checked' : '') : 'checked'} style="width: 18px; height: 18px; cursor: pointer;">
        <label for="dokter-aktif" style="cursor: pointer; font-weight: 500; font-size: 0.95rem;">Status Aktif</label>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Master Dokter' : 'Tambah Master Dokter Baru', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('dokter-form');
      const formData = {
        nama: form.nama.value,
        spesialisasi: form.spesialisasi.value,
        aktif: form.aktif.checked
      };

      const validations = {
        nama: validateRequired(formData.nama, 'Nama Dokter'),
      };

      const errors = validateForm(validations);
      if (errors) { showFormErrors(form, errors); return; }

      if (isEdit) {
        const res = await api.put(`/master-dokter/${dokter.id}`, formData);
        if (res.success) {
          showToast('Master dokter berhasil diupdate', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal mengupdate master dokter', 'error');
        }
      } else {
        const res = await api.post('/master-dokter', formData);
        if (res.success) {
          showToast('Master dokter berhasil ditambahkan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menambahkan master dokter', 'error');
        }
      }
    }
  });
}

async function handleDeleteDokter(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus master dokter ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  const res = await api.delete(`/master-dokter/${id}`);
  if (res.success) {
    showToast('Master dokter berhasil dihapus', 'success');
    loadData();
  } else {
    showToast(res.message || 'Gagal menghapus master dokter', 'error');
  }
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Master Dokter</h1>
          <p class="page-subtitle">Daftar dokter rumah sakit untuk pengisian indikator mutu pelayanan</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="search-dokter" class="form-control" placeholder="Cari dokter / spesialisasi..." style="width: 260px;" value="${state.search}">
          <button class="btn btn-primary" id="btn-add-dokter">+ Tambah Dokter</button>
        </div>
      </div>
      <div id="dokter-table-container"></div>
      <div id="pagination-container"></div>
    </div>
  `;

  document.getElementById('btn-add-dokter').addEventListener('click', () => openDokterModal());

  const searchInput = document.getElementById('search-dokter');
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
