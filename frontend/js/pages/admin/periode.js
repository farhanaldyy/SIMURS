import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = { periodes: [] };

async function loadData() {
  const res = await api.get('/periode');
  if (res.success) {
    state.periodes = res.data;
    renderPeriodeTable();
  }
}

function renderPeriodeTable() {
  const formatBulan = (b) => {
    const list = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return list[b - 1] || b;
  };

  const columns = [
    { label: 'No', render: (_, i) => i + 1 },
    { label: 'Bulan', render: (r) => formatBulan(r.bulan) },
    { label: 'Tahun', key: 'tahun' },
    {
      label: 'Status',
      key: 'status',
      render: (r) => r.status === 'open' 
        ? '<span class="badge badge-success">Terbuka (Open)</span>' 
        : '<span class="badge badge-danger">Terkunci (Closed)</span>'
    },
    {
      label: 'Aksi',
      render: (r) => r.status === 'open'
        ? `<button class="btn btn-danger btn-sm btn-close-periode" data-id="${r.id}">🔒 Kunci Periode</button>`
        : `<button class="btn btn-outline btn-sm btn-open-periode" data-id="${r.id}" style="color: var(--color-warning, #d97706); border-color: var(--color-warning, #d97706);">🔓 Buka Periode</button>`
    }
  ];

  renderTable('periode-table-container', columns, state.periodes);

  document.querySelectorAll('.btn-close-periode').forEach(btn => {
    btn.addEventListener('click', () => handleClose(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-open-periode').forEach(btn => {
    btn.addEventListener('click', () => handleOpen(parseInt(btn.dataset.id)));
  });
}

async function handleClose(id) {
  if (!confirm('PENTING: Menutup periode akan mengunci seluruh data pada bulan tersebut. Yakin ingin menutup periode ini?')) return;
  try {
    const res = await api.patch(`/periode/${id}/close`);
    if (res.success) {
      showToast('Periode berhasil ditutup (dikunci)', 'success');
      if (Store.periodeAktif && Store.periodeAktif.id === id) {
        Store.set('periodeAktif', { ...Store.periodeAktif, status: 'closed' });
        window.dispatchEvent(new CustomEvent('periodeChanged'));
      }
      await loadData();
      // Dispatch event to refresh topbar selectors
      window.dispatchEvent(new CustomEvent('updatePeriodesList'));
    } else {
      showToast(res.message || 'Gagal menutup periode', 'error');
    }
  } catch (err) {
    console.error('Error closing periode:', err);
    showToast('Terjadi kesalahan saat menutup periode', 'error');
  }
}

async function handleOpen(id) {
  if (!confirm('Apakah Anda yakin ingin membuka kembali penguncian periode ini? Users akan dapat mengubah data kembali.')) return;
  try {
    const res = await api.patch(`/periode/${id}/open`);
    if (res.success) {
      showToast('Periode berhasil dibuka kembali', 'success');
      if (Store.periodeAktif && Store.periodeAktif.id === id) {
        Store.set('periodeAktif', { ...Store.periodeAktif, status: 'open' });
        window.dispatchEvent(new CustomEvent('periodeChanged'));
      }
      await loadData();
      // Dispatch event to refresh topbar selectors
      window.dispatchEvent(new CustomEvent('updatePeriodesList'));
    } else {
      showToast(res.message || 'Gagal membuka periode', 'error');
    }
  } catch (err) {
    console.error('Error opening periode:', err);
    showToast('Terjadi kesalahan saat membuka periode', 'error');
  }
}

function openAddPeriodeModal() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
    const list = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>${list[m - 1]}</option>`;
  }).join('');

  const modalHTML = `
    <form id="periode-form">
      <div class="form-group">
        <label class="form-label">Bulan <span class="required">*</span></label>
        <select name="bulan" class="form-control" required>
          ${monthOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tahun <span class="required">*</span></label>
        <input type="number" name="tahun" class="form-control" value="${currentYear}" min="2020" max="2100" required>
      </div>
    </form>
  `;

  showModal('Tambah Periode Baru', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('periode-form');
      const formData = Object.fromEntries(new FormData(form));

      formData.bulan = parseInt(formData.bulan);
      formData.tahun = parseInt(formData.tahun);

      const res = await api.post('/periode', formData);
      if (res.success) {
        showToast('Periode baru berhasil dibuat', 'success');
        closeModal();
        loadData();
        // Dispatch event to refresh topbar selectors
        window.dispatchEvent(new CustomEvent('updatePeriodesList'));
      } else {
        showToast(res.message || 'Gagal membuat periode', 'error');
      }
    }
  });
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kelola Periode</h1>
          <p class="page-subtitle">Daftar periode pelaporan mutu bulanan SIMURS</p>
        </div>
        <button class="btn btn-primary" id="btn-add-periode">+ Tambah Periode</button>
      </div>
      <div id="periode-table-container"></div>
    </div>
  `;

  document.getElementById('btn-add-periode').addEventListener('click', openAddPeriodeModal);
  await loadData();
};

export const destroy = () => {};
