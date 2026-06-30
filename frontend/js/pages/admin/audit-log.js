import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal } from '../../components/modal.js';

let state = { logs: [], page: 1, limit: 15, total: 0 };

async function loadData() {
  const params = { page: state.page, limit: state.limit };
  const queryStr = new URLSearchParams(params).toString();
  const res = await api.get(`/audit-log?${queryStr}`);
  
  if (res.success) {
    state.logs = res.data;
    state.total = res.meta.total;
    renderLogsTable();
    renderPagination('audit-pagination-container', state.total, state.page, state.limit, (p) => {
      state.page = p;
      loadData();
    });
  }
}

function renderLogsTable() {
  const actionBadges = {
    create: '<span class="badge badge-success">Create</span>',
    update: '<span class="badge badge-primary">Update</span>',
    delete: '<span class="badge badge-danger">Delete</span>'
  };

  const columns = [
    { label: 'Waktu', render: (r) => new Date(r.created_at).toLocaleString('id-ID') },
    { label: 'User', key: 'user_nama' },
    { label: 'Tabel', key: 'tabel' },
    { label: 'ID Record', key: 'record_id' },
    { label: 'Aksi', render: (r) => actionBadges[r.aksi] || r.aksi },
    {
      label: 'Aksi',
      render: (r) => `<button class="btn btn-outline btn-sm btn-detail-audit" data-id="${r.id}">Detail</button>`
    }
  ];

  renderTable('audit-table-container', columns, state.logs);

  document.querySelectorAll('.btn-detail-audit').forEach(btn => {
    btn.addEventListener('click', () => {
      const log = state.logs.find(x => x.id == btn.dataset.id);
      if (log) openDetailModal(log);
    });
  });
}

function openDetailModal(log) {
  const oldJSON = log.data_lama ? JSON.stringify(log.data_lama, null, 2) : '-';
  const newJSON = log.data_baru ? JSON.stringify(log.data_baru, null, 2) : '-';

  const modalHTML = `
    <div style="font-family: monospace; font-size: 0.9rem;">
      <div style="margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div><strong>Waktu:</strong> ${new Date(log.created_at).toLocaleString('id-ID')}</div>
        <div><strong>User:</strong> ${log.user_nama}</div>
        <div><strong>Tabel:</strong> ${log.tabel} (ID: ${log.record_id})</div>
        <div><strong>Aksi:</strong> ${log.aksi.toUpperCase()}</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div style="font-weight: bold; margin-bottom: 4px; color: var(--danger);">Data Lama (-)</div>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 350px;">${oldJSON}</pre>
        </div>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px; color: var(--success);">Data Baru (+)</div>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 350px;">${newJSON}</pre>
        </div>
      </div>
    </div>
  `;

  showModal('Detail Perubahan Audit Trail', modalHTML, {
    confirmText: 'Tutup',
    onConfirm: () => {}
  });
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Trail</h1>
          <p class="page-subtitle">Log aktivitas modifikasi data pada sistem pelaporan mutu</p>
        </div>
      </div>
      <div id="audit-table-container"></div>
      <div id="audit-pagination-container"></div>
    </div>
  `;

  await loadData();
};

export const destroy = () => {};
