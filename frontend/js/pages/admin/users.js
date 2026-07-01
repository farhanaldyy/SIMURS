import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { NAV_GROUPS } from '../../config/modules.js';
import { validateRequired, showFormErrors, validateForm } from '../../utils/validator.js';

let state = { users: [], units: [] };

async function loadData() {
  const [usersRes, unitsRes] = await Promise.all([
    api.get('/users'),
    api.get('/units')
  ]);

  if (usersRes.success) {
    state.users = usersRes.data;
    renderUserTable();
  }
  if (unitsRes.success) {
    state.units = unitsRes.data;
  }
}

function renderUserTable() {
  const columns = [
    { label: 'No', render: (_, i) => i + 1 },
    { label: 'Nama', key: 'nama' },
    { label: 'Username', key: 'username' },
    {
      label: 'Role',
      key: 'role',
      render: (r) => {
        const badges = {
          admin: '<span class="badge badge-success">Admin</span>',
          pic_mutu: '<span class="badge badge-primary">PIC Mutu</span>',
          komite: '<span class="badge badge-warning">Komite Mutu</span>',
          petugas: '<span class="badge badge-outline">Petugas</span>'
        };
        return badges[r.role] || r.role;
      }
    },
    { label: 'Unit', key: 'unit', render: (r) => r.unit ? r.unit.nama_unit : '-' },
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
          <button class="btn btn-outline btn-sm btn-edit-user" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-user" data-id="${r.id}">Hapus</button>
        </div>
      `
    }
  ];

  renderTable('users-table-container', columns, state.users);

  document.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = state.users.find(x => x.id == btn.dataset.id);
      if (u) openUserModal(u);
    });
  });

  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteUser(parseInt(btn.dataset.id));
    });
  });
}

function openUserModal(user = null) {
  const isEdit = !!user;
  
  let allowed = [];
  if (user && user.allowed_modules) {
    try {
      allowed = JSON.parse(user.allowed_modules);
    } catch (e) {
      allowed = [];
    }
  }

  const unitOptions = [
    '<option value="">Pilih Unit...</option>',
    ...state.units.map(u => `
      <option value="${u.id}" ${user?.unit_id === u.id ? 'selected' : ''}>${u.nama_unit}</option>
    `)
  ].join('');

  const modalHTML = `
    <form id="user-form">
      <div class="form-group">
        <label class="form-label">Nama Lengkap <span class="required">*</span></label>
        <input type="text" name="nama" class="form-control" value="${user?.nama || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Username <span class="required">*</span></label>
        <input type="text" name="username" class="form-control" value="${user?.username || ''}" required ${isEdit ? 'disabled' : ''}>
      </div>
      <div class="form-group">
        <label class="form-label">Password ${isEdit ? '(kosongkan jika tidak diubah)' : '<span class="required">*</span>'}</label>
        <input type="password" name="password" class="form-control" ${isEdit ? '' : 'required'} minlength="6" placeholder="Minimal 6 karakter">
        <small class="form-text text-muted" style="display: block; margin-top: 4px; color: #6c757d;">Password minimal harus 6 karakter.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Role <span class="required">*</span></label>
        <select name="role" class="form-control" required>
          <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="pic_mutu" ${user?.role === 'pic_mutu' ? 'selected' : ''}>PIC Mutu</option>
          <option value="komite" ${user?.role === 'komite' ? 'selected' : ''}>Komite Mutu</option>
          <option value="petugas" ${user?.role === 'petugas' ? 'selected' : ''}>Petugas</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Unit</label>
        <select name="unit_id" class="form-control">
          ${unitOptions}
        </select>
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="aktif" class="form-control">
            <option value="true" ${user.aktif === true ? 'selected' : ''}>Aktif</option>
            <option value="false" ${user.aktif === false ? 'selected' : ''}>Nonaktif</option>
          </select>
        </div>
      ` : ''}

      <div class="form-group" id="permission-checklist-container" style="display: none; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
        <label class="form-label" style="font-weight: bold; margin-bottom: 10px;">Hak Akses Modul</label>
        <div style="max-height: 250px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa;">
          ${NAV_GROUPS.filter(g => g.title.includes('Dashboard') === false).map(group => {
            const itemsHTML = group.items.map(item => {
              const checked = allowed.includes(item.hash) ? 'checked' : '';
              return `
                <div style="margin-bottom: 6px; display: flex; align-items: center;">
                  <input type="checkbox" name="allowed_modules_chk" value="${item.hash}" id="chk-${item.hash}" ${checked} style="margin-right: 8px; width: auto; height: auto;">
                  <label for="chk-${item.hash}" style="margin: 0; font-weight: normal; cursor: pointer; font-size: 0.95em;">${item.label}</label>
                </div>
              `;
            }).join('');
            return `
              <div style="margin-bottom: 15px;">
                <div style="font-weight: bold; font-size: 0.9em; color: #333; margin-bottom: 6px; border-bottom: 1px solid #e5e5e5; padding-bottom: 3px;">
                  ${group.title}
                </div>
                <div style="padding-left: 10px;">
                  ${itemsHTML}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Pengguna' : 'Tambah Pengguna', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('user-form');
      const formData = Object.fromEntries(new FormData(form));

      // Client-side validations
      const validations = {
        nama: validateRequired(formData.nama, 'Nama Lengkap'),
      };
      if (!isEdit) {
        validations.username = validateRequired(formData.username, 'Username');
        validations.password = validateRequired(formData.password, 'Password') || (formData.password.length < 6 ? 'Password minimal 6 karakter' : null);
      } else if (formData.password && formData.password.length < 6) {
        validations.password = 'Password minimal 6 karakter';
      }
      const errors = validateForm(validations);
      if (errors) { showFormErrors(form, errors); return; }

      if (formData.unit_id) {
        formData.unit_id = parseInt(formData.unit_id);
      } else {
        delete formData.unit_id;
      }

      // Read selected modules
      const role = formData.role;
      if (role === 'pic_mutu' || role === 'petugas') {
        const checkedBoxes = Array.from(form.querySelectorAll('input[name="allowed_modules_chk"]:checked'));
        formData.allowed_modules = checkedBoxes.map(cb => cb.value);
      } else {
        formData.allowed_modules = null; // Admin/komite don't need restricted list
      }
      delete formData.allowed_modules_chk;

      if (isEdit) {
        formData.aktif = formData.aktif === 'true';
        if (!formData.password) delete formData.password;
        const res = await api.put(`/users/${user.id}`, formData);
        if (res.success) {
          showToast('User berhasil diupdate', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal mengupdate user', 'error');
          if (res.errors) {
            const formErrors = {};
            res.errors.forEach(e => {
              formErrors[e.field] = e.message;
            });
            showFormErrors(form, formErrors);
          }
        }
      } else {
        const res = await api.post('/users', formData);
        if (res.success) {
          showToast('User berhasil ditambahkan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menambahkan user', 'error');
          if (res.errors) {
            const formErrors = {};
            res.errors.forEach(e => {
              formErrors[e.field] = e.message;
            });
            showFormErrors(form, formErrors);
          }
        }
      }
    }
  });

  // Toggle checklist visibility based on role select
  const form = document.getElementById('user-form');
  if (form) {
    const roleSelect = form.querySelector('[name="role"]');
    const checklistContainer = form.querySelector('#permission-checklist-container');
    
    if (roleSelect && checklistContainer) {
      const toggleChecklist = () => {
        const role = roleSelect.value;
        if (role === 'pic_mutu' || role === 'petugas') {
          checklistContainer.style.display = 'block';
        } else {
          checklistContainer.style.display = 'none';
        }
      };
      
      roleSelect.addEventListener('change', toggleChecklist);
      toggleChecklist();
    }
  }
}

async function handleDeleteUser(id) {
  if (id === Store.user?.id) {
    showToast('Anda tidak dapat menghapus akun Anda sendiri', 'warning');
    return;
  }
  if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }
  const res = await api.delete(`/users/${id}`);
  if (res.success) {
    showToast('Pengguna berhasil dihapus', 'success');
    loadData();
  } else {
    showToast(res.message || 'Gagal menghapus pengguna', 'error');
  }
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kelola Pengguna</h1>
          <p class="page-subtitle">Daftar pengguna dan pengelolaan hak akses SIMURS</p>
        </div>
        <button class="btn btn-primary" id="btn-add-user">+ Tambah Pengguna</button>
      </div>
      <div id="users-table-container"></div>
    </div>
  `;

  document.getElementById('btn-add-user').addEventListener('click', () => openUserModal());
  await loadData();
};

export const destroy = () => {};
