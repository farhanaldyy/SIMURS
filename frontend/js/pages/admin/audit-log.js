import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal } from '../../components/modal.js';

let state = {
  logs: [],
  page: 1,
  limit: 15,
  total: 0,
  filters: {
    search: '',
    aksi: '',
    tabel: ''
  }
};

let searchTimeout = null;

async function loadData() {
  const params = { page: state.page, limit: state.limit };
  if (state.filters.search) params.search = state.filters.search;
  if (state.filters.aksi) params.aksi = state.filters.aksi;
  if (state.filters.tabel) params.tabel = state.filters.tabel;

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
      label: 'Detail',
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
          <div style="font-weight: bold; margin-bottom: 4px; color: var(--danger, #ef4444);">Data Lama (-)</div>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 350px;">${oldJSON}</pre>
        </div>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px; color: var(--success, #10b981);">Data Baru (+)</div>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 350px;">${newJSON}</pre>
        </div>
      </div>
    </div>
  `;

  showModal('Detail Perubahan Audit Trail', modalHTML);
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

      <!-- Filter Section -->
      <div class="card" style="margin-bottom: 20px; padding: 16px; background: var(--bg-card, #ffffff); border-radius: 8px; border: 1px solid var(--border-color, #e2e8f0);">
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;">
          <div style="flex: 1; min-width: 240px;">
            <label class="form-label" style="font-size: 0.85rem; margin-bottom: 4px; display: block; color: var(--text-muted, #64748b);">Pencarian Kata Kunci</label>
            <input type="text" id="filter-search" class="form-control" placeholder="Cari nama user, tabel, atau ID record..." value="${state.filters.search}">
          </div>
          <div style="width: 160px;">
            <label class="form-label" style="font-size: 0.85rem; margin-bottom: 4px; display: block; color: var(--text-muted, #64748b);">Aksi</label>
            <select id="filter-aksi" class="form-control">
              <option value="" ${state.filters.aksi === '' ? 'selected' : ''}>Semua Aksi</option>
              <option value="create" ${state.filters.aksi === 'create' ? 'selected' : ''}>Create</option>
              <option value="update" ${state.filters.aksi === 'update' ? 'selected' : ''}>Update</option>
              <option value="delete" ${state.filters.aksi === 'delete' ? 'selected' : ''}>Delete</option>
            </select>
          </div>
          <div style="width: 180px;">
            <label class="form-label" style="font-size: 0.85rem; margin-bottom: 4px; display: block; color: var(--text-muted, #64748b);">Tabel</label>
            <input type="text" id="filter-tabel" class="form-control" placeholder="Nama tabel..." value="${state.filters.tabel}">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-search-audit" class="btn btn-primary">Cari</button>
            <button id="btn-reset-audit" class="btn btn-outline">Reset</button>
          </div>
        </div>
      </div>

      <div id="audit-table-container"></div>
      <div id="audit-pagination-container"></div>
    </div>
  `;

  const searchInput = container.querySelector('#filter-search');
  const aksiSelect = container.querySelector('#filter-aksi');
  const tabelInput = container.querySelector('#filter-tabel');
  const btnSearch = container.querySelector('#btn-search-audit');
  const btnReset = container.querySelector('#btn-reset-audit');

  const triggerSearch = () => {
    state.filters.search = searchInput.value;
    state.filters.aksi = aksiSelect.value;
    state.filters.tabel = tabelInput.value;
    state.page = 1;
    loadData();
  };

  btnSearch.addEventListener('click', triggerSearch);

  btnReset.addEventListener('click', () => {
    state.filters.search = '';
    state.filters.aksi = '';
    state.filters.tabel = '';
    searchInput.value = '';
    aksiSelect.value = '';
    tabelInput.value = '';
    state.page = 1;
    loadData();
  });

  const onKeyup = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    } else {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(triggerSearch, 400);
    }
  };

  searchInput.addEventListener('keyup', onKeyup);
  tabelInput.addEventListener('keyup', onKeyup);
  aksiSelect.addEventListener('change', triggerSearch);

  await loadData();
};

export const destroy = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
};
