import Store from '../../store.js';
import { api } from '../../api/client.js';
import { renderTable } from '../../components/table.js';
import { renderPagination } from '../../components/pagination.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { validateRequired, validateNoRM, showFormErrors, validateForm } from '../../utils/validator.js';

export function createGenericIndicatorPage(config) {
  let state = { data: [], page: 1, limit: 10, total: 0, summary: {}, summaryData: null };
  const endpoint = config.endpoint;

  async function loadData() {
    const params = { page: state.page, limit: state.limit };
    if (Store.periodeAktif) params.periode_id = Store.periodeAktif.id;
    if (Store.unitAktif && !config.ignoreUnit) params.unit_id = Store.unitAktif.id;

    const queryString = new URLSearchParams(params).toString();
    
    // Build promises list
    const promises = [
      api.get(`${endpoint}?${queryString}`),
      api.get(`${endpoint}/summary?${queryString}`)
    ];

    if (config.hasSummaryData && Store.periodeAktif) {
      promises.push(api.get(`${endpoint}/summary-data?periode_id=${Store.periodeAktif.id}`));
    }

    try {
      const results = await Promise.all(promises);
      const listRes = results[0];
      const summaryRes = results[1];
      const summaryDataRes = results[2];

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

      if (summaryDataRes && summaryDataRes.success) {
        state.summaryData = summaryDataRes.data;
        renderSummaryDataCard();
      }
    } catch (err) {
      console.error('Error loading indicator data:', err);
      showToast('Gagal memuat data', 'error');
    }
  }

  function renderDataTable() {
    const columns = [
      { label: 'No', render: (_, i) => (state.page - 1) * state.limit + i + 1 },
      ...config.columns,
      {
        label: 'Aksi',
        render: (r) => `
          <div class="actions">
            <button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>
            ${Store.canDelete() ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        `
      }
    ];

    renderTable('table-container', columns, state.data, {
      rowClass: config.rowClass
    });

    // Bind events
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = state.data.find(d => d.id == btn.dataset.id);
        if (row) openFormModal(row);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => handleDelete(parseInt(btn.dataset.id)));
    });
  }

  function renderSummary() {
    const s = state.summary;
    const container = document.getElementById('summary-container');
    if (!container) return;

    let targetMetric = `${s.persen || 0}%`;
    let labelMetric = 'Kepatuhan';
    let numeratorText = 'Patuh (N)';
    let denominatorText = 'Denominator (D)';

    if (config.metricType === 'average') {
      targetMetric = s.rataRata || 0;
      labelMetric = 'Rata-rata';
      numeratorText = 'Total';
    } else if (config.metricType === 'count') {
      targetMetric = s.total || 0;
      labelMetric = 'Jumlah Kejadian';
    }

    container.innerHTML = `
      <div class="summary-item"><div class="summary-value">${s.total || 0}</div><div class="summary-label">Total Data</div></div>
      ${config.metricType !== 'count' && s.numerator !== undefined ? `<div class="summary-item"><div class="summary-value">${s.numerator}</div><div class="summary-label">${numeratorText}</div></div>` : ''}
      ${config.metricType === 'compliance' && s.denominator !== undefined ? `<div class="summary-item"><div class="summary-value">${s.denominator}</div><div class="summary-label">${denominatorText}</div></div>` : ''}
      <div class="summary-item"><div class="summary-value">${targetMetric}</div><div class="summary-label">${labelMetric}</div></div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, parseFloat(s.standar) || 100)}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar}</div>
      </div>
    `;
  }

  function renderSummaryDataCard() {
    const container = document.getElementById('summary-data-container');
    if (!container || !state.summaryData) return;

    const fieldsHTML = config.summaryDataFields.map(f => {
      const val = state.summaryData[f.name] || 0;
      return `<div style="margin-right: 24px"><strong>${f.label}:</strong> ${val}</div>`;
    }).join('');

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="font-size: 1.2rem; margin-right: 24px">📋 <strong>Parameter Periode:</strong></div>
          ${fieldsHTML}
        </div>
        <button class="btn btn-outline btn-sm" id="btn-edit-summary-data">Edit Parameter</button>
      </div>
    `;

    document.getElementById('btn-edit-summary-data').addEventListener('click', openSummaryDataModal);
  }

  function openSummaryDataModal() {
    const fieldsHTML = config.summaryDataFields.map(f => `
      <div class="form-group">
        <label class="form-label">${f.label} <span class="required">*</span></label>
        <input type="number" name="${f.name}" class="form-control" value="${state.summaryData?.[f.name] || 0}" min="0" required>
      </div>
    `).join('');

    showModal('Edit Parameter Bulanan', `
      <form id="summary-data-form">
        ${fieldsHTML}
      </form>
    `, {
      confirmText: 'Simpan',
      onConfirm: async () => {
        const form = document.getElementById('summary-data-form');
        const formData = Object.fromEntries(new FormData(form));

        for (const k in formData) {
          formData[k] = parseInt(formData[k]);
        }
        formData.periode_id = Store.periodeAktif.id;

        const res = await api.post(`${endpoint}/summary-data`, formData);
        if (res.success) {
          showToast('Parameter berhasil disimpan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menyimpan', 'error');
        }
      }
    });
  }

  function openFormModal(data = null) {
    const isEdit = !!data;
    if (!isEdit) {
      if (!Store.periodeAktif) {
        showToast('Pilih periode terlebih dahulu pada menu di atas sebelum menambahkan data', 'warning');
        return;
      }
      if (!config.ignoreUnit && !Store.unitAktif && !Store.user.unit_id) {
        showToast('Pilih unit terlebih dahulu pada menu di atas sebelum menambahkan data', 'warning');
        return;
      }
    }
    
    // Group fields by row if specified
    const rows = {};
    config.fields.forEach(f => {
      if (isEdit && f.hideOnEdit) return;
      const rowId = f.row || 0;
      if (!rows[rowId]) rows[rowId] = [];
      rows[rowId].push(f);
    });

    const formHTML = `
      <form id="modul-form">
        ${Object.keys(rows).map(rowId => {
          const fields = rows[rowId];
          if (fields.length === 1) {
            return renderFieldHTML(fields[0], data);
          } else {
            return `
              <div class="form-row">
                ${fields.map(f => renderFieldHTML(f, data)).join('')}
              </div>
            `;
          }
        }).join('')}
      </form>
    `;

    showModal(isEdit ? `Edit ${config.title}` : `Tambah ${config.title}`, formHTML, {
      confirmText: 'Simpan',
      width: config.modalWidth,
      onConfirm: async () => {
        const form = document.getElementById('modul-form');
        const formData = Object.fromEntries(new FormData(form));

        if (config.beforeSubmit) {
          config.beforeSubmit(formData);
        }

        // Validate
        const validators = {};
        config.fields.forEach(f => {
          if (f.required) {
            if (f.name === 'no_rm') {
              validators[f.name] = validateNoRM(formData[f.name]);
            } else {
              validators[f.name] = validateRequired(formData[f.name], f.label);
            }
          }
        });

        const errors = validateForm(validators);
        if (errors) { showFormErrors(form, errors); return; }

        // Process data formats
        config.fields.forEach(f => {
          if (f.type === 'number') {
            formData[f.name] = formData[f.name] ? parseInt(formData[f.name]) : null;
          } else if (f.type === 'boolean') {
            formData[f.name] = formData[f.name] === 'true';
          }
        });

        if (!isEdit) {
          if (Store.periodeAktif) formData.periode_id = Store.periodeAktif.id;
          if (!config.ignoreUnit) {
            if (Store.unitAktif) formData.unit_id = Store.unitAktif.id;
            else if (Store.user.unit_id) formData.unit_id = Store.user.unit_id;
          }
        }

        const res = isEdit 
          ? await api.put(`${endpoint}/${data.id}`, formData) 
          : await api.post(endpoint, formData);

        if (res.success) {
          showToast(isEdit ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan', 'success');
          closeModal();
          loadData();
        } else {
          showToast(res.message || 'Gagal menyimpan', 'error');
        }
      }
    });
  }

  function renderFieldHTML(f, data) {
    const val = data ? data[f.name] : '';
    
    if (f.type === 'select') {
      const optionsHTML = f.options.map(opt => `
        <option value="${opt.value}" ${val === opt.value ? 'selected' : ''}>${opt.label}</option>
      `).join('');
      return `
        <div class="form-group">
          <label class="form-label">${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
          <select name="${f.name}" class="form-control" ${f.required ? 'required' : ''}>
            ${optionsHTML}
          </select>
        </div>
      `;
    }

    if (f.type === 'boolean') {
      return `
        <div class="form-group">
          <label class="form-label">${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
          <select name="${f.name}" class="form-control" ${f.required ? 'required' : ''}>
            <option value="true" ${val === true ? 'selected' : ''}>Iya</option>
            <option value="false" ${val === false ? 'selected' : ''}>Tidak</option>
          </select>
        </div>
      `;
    }

    if (f.type === 'custom') {
      return f.render ? f.render(val, data) : '';
    }

    if (f.type === 'text' || f.type === 'number' || f.type === 'date' || f.type === 'time') {
      let inputVal = val;
      if (f.type === 'date' && val) {
        inputVal = new Date(val).toISOString().split('T')[0];
      } else if (f.type === 'time' && val) {
        const d = new Date(val);
        inputVal = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      }

      return `
        <div class="form-group">
          <label class="form-label">${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
          <input type="${f.type}" name="${f.name}" class="form-control" value="${inputVal}" ${f.required ? 'required' : ''} ${f.type === 'number' ? 'min="0"' : ''}>
        </div>
      `;
    }

    return '';
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const res = await api.delete(`${endpoint}/${id}`);
    if (res.success) {
      showToast('Data berhasil dihapus', 'success');
      loadData();
    } else {
      showToast(res.message || 'Gagal menghapus', 'error');
    }
  }

  return {
    async render(container) {
      container.innerHTML = `
        <div class="module-page">
          <div class="page-header">
            <div>
              <h1 class="page-title">${config.title}</h1>
              <p class="page-subtitle">${config.subtitle}</p>
            </div>
            <button class="btn btn-primary" id="btn-add">+ Tambah Data</button>
          </div>
          <div id="summary-data-container"></div>
          <div id="table-container"></div>
          <div id="pagination-container"></div>
          <div class="summary-box" id="summary-container"></div>
        </div>
      `;

      document.getElementById('btn-add').addEventListener('click', () => openFormModal());
      await loadData();
      window.addEventListener('periodeChanged', loadData);
      if (!config.ignoreUnit) window.addEventListener('unitChanged', loadData);
    },

    destroy() {
      window.removeEventListener('periodeChanged', loadData);
      if (!config.ignoreUnit) window.removeEventListener('unitChanged', loadData);
    }
  };
}
