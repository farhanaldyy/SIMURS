import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { showToast } from '../../components/toast.js';
import { api } from '../../api/client.js';

let masterTindakanOptions = [];

async function loadMasterTindakanOptions() {
  const res = await api.get('/master-tindakan?all=true');
  if (res.success) {
    masterTindakanOptions = res.data;
  }
}

const profesiLabels = {
  dokter: 'Dokter',
  perawat: 'Perawat',
  bidan: 'Bidan',
  nakes_lain: 'Nakes Lain'
};

const tindakanLabels = {
  hr: '<span class="badge badge-success">HR</span>',
  hw: '<span class="badge badge-success">HW</span>',
  hr_hw: '<span class="badge badge-success">HR & HW</span>',
  missed: '<span class="badge badge-danger">missed</span>'
};

const pageObj = createGenericIndicatorPage({
  title: 'Kepatuhan Kebersihan Tangan',
  subtitle: 'Pencatatan kepatuhan kebersihan tangan (KKT) sesuai dengan standar WHO 5 Moments',
  endpoint: '/kepatuhan-kebersihan-tangan',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Profesi', key: 'profesi', render: (r) => profesiLabels[r.profesi] || r.profesi },
    { label: 'Tindakan', key: 'masterTindakan', render: (r) => r.masterTindakan?.nama || '<span style="color:var(--color-muted)">-</span>' },
    { label: 'bef-pat.', key: 'momen_1', render: (r) => r.momen_1 ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { label: 'bef-asept.', key: 'momen_2', render: (r) => r.momen_2 ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { label: 'aft-b.f.', key: 'momen_3', render: (r) => r.momen_3 ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { label: 'aft-pat.', key: 'momen_4', render: (r) => r.momen_4 ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { label: 'aft-p.surr.', key: 'momen_5', render: (r) => r.momen_5 ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { label: 'Action', key: 'tindakan', render: (r) => tindakanLabels[r.tindakan] || r.tindakan },
    { label: 'Gloves', key: 'gloves', render: (r) => r.gloves ? '<span class="badge badge-info">✓</span>' : '<span style="color:var(--color-muted)">-</span>' },
    { 
      label: 'Capaian', 
      render: (r) => {
        if (!r.masterTindakan || !r.masterTindakan.nilai) return '<span style="color:var(--color-muted)">-</span>';
        const momentsCount = (r.momen_1 ? 1 : 0) + (r.momen_2 ? 1 : 0) + (r.momen_3 ? 1 : 0) + (r.momen_4 ? 1 : 0) + (r.momen_5 ? 1 : 0);
        const score = Math.round((momentsCount / r.masterTindakan.nilai) * 100);
        return `<strong>${score}%</strong> <span style="font-size: 0.8rem; color: var(--color-text-muted);">(${momentsCount}/${r.masterTindakan.nilai})</span>`;
      }
    }
  ],
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    {
      name: 'profesi',
      label: 'Profesi',
      type: 'select',
      options: [
        { value: 'dokter', label: 'Dokter' },
        { value: 'perawat', label: 'Perawat' },
        { value: 'bidan', label: 'Bidan' },
        { value: 'nakes_lain', label: 'Nakes Lain' }
      ],
      required: true,
      row: 1
    },
    {
      name: 'tindakan_id',
      label: 'Tindakan Master',
      type: 'custom',
      row: 1,
      render: (val, data) => {
        const selectedId = data?.tindakan_id || '';
        const optionsHTML = masterTindakanOptions.map(item => `
          <option value="${item.id}" ${String(selectedId) === String(item.id) ? 'selected' : ''}>${item.nama} (Nilai: ${item.nilai})</option>
        `).join('');
        return `
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Tindakan Master <span class="required">*</span></label>
            <select name="tindakan_id" class="form-control" required>
              <option value="">-- Pilih Tindakan --</option>
              ${optionsHTML}
            </select>
          </div>
        `;
      }
    },
    {
      name: 'indications',
      label: 'Indication (Indikasi WHO)',
      type: 'custom',
      row: 2,
      render: (val, data) => {
        return `
          <div class="form-group" style="flex: 1;">
            <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Indication (Indikasi WHO)</label>
            <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px; background: var(--bg-light, #f8f9fa); border-radius: 6px; border: 1px dashed var(--border-color, #dee2e6);">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="momen_1" value="true" ${data?.momen_1 ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>bef-pat.</strong> (Sebelum kontak dengan pasien)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="momen_2" value="true" ${data?.momen_2 ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>bef-asept.</strong> (Sebelum tindakan aseptik)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="momen_3" value="true" ${data?.momen_3 ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>aft-b.f.</strong> (Setelah terkena cairan tubuh pasien)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="momen_4" value="true" ${data?.momen_4 ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>aft-pat.</strong> (Setelah kontak dengan pasien)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="momen_5" value="true" ${data?.momen_5 ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>aft-p.surr.</strong> (Setelah kontak dengan lingkungan sekitar pasien)</span>
              </label>
            </div>
          </div>
        `;
      }
    },
    {
      name: 'hh_actions',
      label: 'HH Action & Gloves',
      type: 'custom',
      row: 2,
      render: (val, data) => {
        const t = data?.tindakan || '';
        return `
          <div class="form-group" style="flex: 1;">
            <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">HH Action & Gloves</label>
            <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px; background: var(--bg-light, #f8f9fa); border-radius: 6px; border: 1px dashed var(--border-color, #dee2e6);">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" id="chk-tindakan-hr" value="hr" ${t === 'hr' || t === 'hr_hw' ? 'checked' : ''} style="width: 16px; height: 16px;" onclick="if(this.checked) document.getElementById('chk-tindakan-missed').checked = false;">
                <span><strong>HR</strong> (Handrub)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" id="chk-tindakan-hw" value="hw" ${t === 'hw' || t === 'hr_hw' ? 'checked' : ''} style="width: 16px; height: 16px;" onclick="if(this.checked) document.getElementById('chk-tindakan-missed').checked = false;">
                <span><strong>HW</strong> (Handwash)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" id="chk-tindakan-missed" value="missed" ${t === 'missed' ? 'checked' : ''} style="width: 16px; height: 16px;" onclick="if(this.checked) { document.getElementById('chk-tindakan-hr').checked = false; document.getElementById('chk-tindakan-hw').checked = false; }">
                <span><strong>missed</strong> (Tidak dilakukan)</span>
              </label>
              <div style="border-top: 1px solid var(--border-color, #dee2e6); margin: 6px 0;"></div>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                <input type="checkbox" name="gloves" value="true" ${data?.gloves ? 'checked' : ''} style="width: 16px; height: 16px;">
                <span><strong>gloves</strong> (Memakai sarung tangan)</span>
              </label>
            </div>
          </div>
        `;
      }
    }
  ],
  beforeSubmit: (formData) => {
    formData.momen_1 = formData.momen_1 === 'true';
    formData.momen_2 = formData.momen_2 === 'true';
    formData.momen_3 = formData.momen_3 === 'true';
    formData.momen_4 = formData.momen_4 === 'true';
    formData.momen_5 = formData.momen_5 === 'true';
    formData.gloves = formData.gloves === 'true';

    if (formData.tindakan_id) {
      formData.tindakan_id = parseInt(formData.tindakan_id);
    }

    const hasMoment = formData.momen_1 || formData.momen_2 || formData.momen_3 || formData.momen_4 || formData.momen_5;
    if (!hasMoment) {
      showToast('Setidaknya pilih satu Indikasi (Momen) yang sesuai', 'warning');
      throw new Error('Validation: At least one moment must be selected');
    }

    const isHR = document.getElementById('chk-tindakan-hr').checked;
    const isHW = document.getElementById('chk-tindakan-hw').checked;
    const isMissed = document.getElementById('chk-tindakan-missed').checked;

    if (isMissed) {
      formData.tindakan = 'missed';
    } else if (isHR && isHW) {
      formData.tindakan = 'hr_hw';
    } else if (isHR) {
      formData.tindakan = 'hr';
    } else if (isHW) {
      formData.tindakan = 'hw';
    } else {
      formData.tindakan = '';
    }

    if (!formData.tindakan) {
      showToast('Pilih tindakan kebersihan tangan (HR / HW / missed)', 'warning');
      throw new Error('Validation: Action must be selected');
    }

    if (!formData.tindakan_id) {
      showToast('Pilih Tindakan Master terlebih dahulu', 'warning');
      throw new Error('Validation: Master Tindakan must be selected');
    }
  },
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Peluang (Opportunities)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.numerator || 0}</div>
        <div class="summary-label">Patuh (N)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Persentase Kepatuhan</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, '≥ 85%')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '≥ 85%'}</div>
      </div>
    `;
  }
});

const originalRender = pageObj.render;
pageObj.render = async (container) => {
  await loadMasterTindakanOptions();
  await originalRender(container);
};

export default pageObj;
