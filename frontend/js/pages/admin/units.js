import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { units: [] };

async function loadData() {
  const res = await api.get('/units?all=true');
  if (res.success) {
    state.units = res.data;
    renderUnitTable();
  }
}

function renderUnitTable() {
  const columns = [
    { label: 'No', render: (_, i) => i + 1 },
    { label: 'Nama Unit', key: 'nama_unit' },
    { label: 'Kode Unit', key: 'kode_unit' },
    {
      label: 'Kategori Unit',
      key: 'kategori_unit',
      render: (r) => {
        const cat = (r.kategori_unit || 'rawat_inap').toLowerCase();
        if (cat === 'rawat_inap') return '<span class="badge" style="background:#dbeafe; color:#1e40af;">🛏️ Rawat Inap</span>';
        if (cat === 'unit_khusus') return '<span class="badge" style="background:#fce7f3; color:#9d174d;">🏥 Unit Khusus</span>';
        if (cat === 'igd') return '<span class="badge" style="background:#fee2e2; color:#991b1b;">🚨 IGD</span>';
        if (cat === 'rawat_jalan') return '<span class="badge" style="background:#fef3c7; color:#92400e;">🚶 Rawat Jalan</span>';
        if (cat === 'farmasi') return '<span class="badge" style="background:#f3e8ff; color:#6b21a8;">💊 Farmasi</span>';
        return '<span class="badge" style="background:#f1f5f9; color:#475569;">🛠️ Penunjang</span>';
      }
    },
    {
      label: 'Status',
      key: 'aktif',
      render: (r) => r.aktif 
        ? '<span class="badge badge-success">Aktif</span>' 
        : '<span class="badge badge-danger">Nonaktif</span>'
    },
    {
      label: 'Aksi',
      render: (r) => `
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline btn-sm btn-edit-unit" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-unit" data-id="${r.id}">Hapus</button>
        </div>
      `
    }
  ];

  renderTable('units-table-container', columns, state.units);

  document.querySelectorAll('.btn-edit-unit').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = state.units.find(x => x.id == btn.dataset.id);
      if (u) openUnitModal(u);
    });
  });

  document.querySelectorAll('.btn-delete-unit').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteUnit(parseInt(btn.dataset.id));
    });
  });
}

function openUnitModal(unit = null) {
  const isEdit = !!unit;

  const modalHTML = `
    <form id="unit-form">
      <div class="form-group">
        <label class="form-label">Nama Unit <span class="required">*</span></label>
        <input type="text" name="nama_unit" class="form-control" value="${unit?.nama_unit || ''}" required placeholder="Contoh: Unit Gawat Darurat">
      </div>
      <div class="form-group">
        <label class="form-label">Kode Unit <span class="required">*</span></label>
        <input type="text" name="kode_unit" class="form-control" value="${unit?.kode_unit || ''}" required placeholder="Contoh: igd" ${isEdit ? 'disabled' : ''}>
        <small class="form-text text-muted" style="display: block; margin-top: 4px; color: #6c757d;">Kode unik untuk modul unit (hanya huruf kecil/angka tanpa spasi).</small>
      </div>
      <div class="form-group">
        <label class="form-label">Kategori Unit <span class="required">*</span></label>
        <select name="kategori_unit" class="form-control" required>
          <option value="rawat_inap" ${unit?.kategori_unit === 'rawat_inap' || !unit ? 'selected' : ''}>🛏️ Rawat Inap (Umum)</option>
          <option value="unit_khusus" ${unit?.kategori_unit === 'unit_khusus' ? 'selected' : ''}>🏥 Unit Khusus (Annisa, Perinatologi, ICU, OK, HD)</option>
          <option value="igd" ${unit?.kategori_unit === 'igd' ? 'selected' : ''}>🚨 IGD (Unit Gawat Darurat)</option>
          <option value="rawat_jalan" ${unit?.kategori_unit === 'rawat_jalan' ? 'selected' : ''}>🚶 Rawat Jalan</option>
          <option value="farmasi" ${unit?.kategori_unit === 'farmasi' ? 'selected' : ''}>💊 Farmasi</option>
          <option value="penunjang" ${unit?.kategori_unit === 'penunjang' ? 'selected' : ''}>🛠️ Penunjang / Medis & Non-Medis</option>
        </select>
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="aktif" class="form-control">
            <option value="true" ${unit.aktif === true ? 'selected' : ''}>Aktif</option>
            <option value="false" ${unit.aktif === false ? 'selected' : ''}>Nonaktif</option>
          </select>
        </div>
      ` : ''}
    </form>
  `;

  showModal(isEdit ? 'Edit Unit' : 'Tambah Unit Baru', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('unit-form');
      const formData = Object.fromEntries(new FormData(form));

      // Client-side validations
      const validations = {
        nama_unit: validateRequired(formData.nama_unit, 'Nama Unit'),
      };
      if (!isEdit) {
        validations.kode_unit = validateRequired(formData.kode_unit, 'Kode Unit');
      }

      const errors = validateForm(validations);
      if (errors) { showFormErrors(form, errors); return; }

      if (isEdit) {
        formData.aktif = formData.aktif === 'true';
        // In edit mode, kode_unit is disabled and not in the FormData
        const res = await api.put(`/units/${unit.id}`, formData);
        if (res.success) {
          showToast('Unit berhasil diupdate', 'success');
          closeModal();
          loadData();
          // Dispatch event to refresh unit dropdowns elsewhere
          window.dispatchEvent(new CustomEvent('updateUnitsList'));
        } else {
          showToast(res.message || 'Gagal mengupdate unit', 'error');
        }
      } else {
        const res = await api.post('/units', formData);
        if (res.success) {
          showToast('Unit berhasil ditambahkan', 'success');
          closeModal();
          loadData();
          // Dispatch event to refresh unit dropdowns elsewhere
          window.dispatchEvent(new CustomEvent('updateUnitsList'));
        } else {
          showToast(res.message || 'Gagal menambahkan unit', 'error');
        }
      }
    }
  });
}

async function handleDeleteUnit(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus unit ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  const res = await api.delete(`/units/${id}`);
  if (res.success) {
    showToast('Unit berhasil dihapus', 'success');
    loadData();
    // Dispatch event to refresh unit dropdowns elsewhere
    window.dispatchEvent(new CustomEvent('updateUnitsList'));
  } else {
    showToast(res.message || 'Gagal menghapus unit. Hubungi admin atau nonaktifkan unit jika sudah digunakan.', 'error');
  }
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kelola Unit</h1>
          <p class="page-subtitle">Daftar unit layanan rumah sakit di SIMURS</p>
        </div>
        <button class="btn btn-primary" id="btn-add-unit">+ Tambah Unit</button>
      </div>
      <div id="units-table-container"></div>
    </div>
  `;

  document.getElementById('btn-add-unit').addEventListener('click', () => openUnitModal());
  await loadData();
};

export const destroy = () => {};
