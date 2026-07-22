import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { api } from '../../api/client.js';

let masterTindakanOptions = [];

const apdItemsList = [
  { name: 'penutup_kepala', reqKey: 'apd_penutup_kepala', abbr: 'PK', label: 'Penutup Kepala' },
  { name: 'face_shield', reqKey: 'apd_face_shield', abbr: 'FS', label: 'Face Shield' },
  { name: 'masker', reqKey: 'apd_masker', abbr: 'M', label: 'Masker' },
  { name: 'apron', reqKey: 'apd_apron', abbr: 'A', label: 'Apron' },
  { name: 'coverall', reqKey: 'apd_coverall', abbr: 'C', label: 'Coverall' },
  { name: 'sarung_tangan', reqKey: 'apd_sarung_tangan', abbr: 'ST', label: 'Sarung Tangan' },
  { name: 'cover_shoes', reqKey: 'apd_cover_shoes', abbr: 'CS', label: 'Cover Shoes' }
];

async function loadMasterTindakanOptions() {
  const res = await api.get('/master-tindakan?all=true');
  if (res.success) {
    masterTindakanOptions = res.data;
  }
}

function getRequiredItemsForRecord(r) {
  const master = r.master_tindakan || masterTindakanOptions.find(m => m.nama?.trim().toLowerCase() === r.tindakan?.trim().toLowerCase());
  if (!master) return apdItemsList;
  const reqs = apdItemsList.filter(item => master[item.reqKey] === true);
  return reqs.length > 0 ? reqs : apdItemsList;
}

const pageObj = createGenericIndicatorPage({
  title: 'Kepatuhan Penggunaan APD',
  subtitle: 'Kepatuhan penggunaan Alat Pelindung Diri (APD) pada petugas sesuai standar tindakan di Master Tindakan',
  endpoint: '/kepatuhan-apd',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', width: '110px', align: 'center', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'Profesi', key: 'profesi', width: '100px' },
    { label: 'Tindakan', key: 'tindakan' },
    {
      label: 'Status APD (Wajib vs Dipakai)',
      render: (r) => {
        const reqItems = getRequiredItemsForRecord(r);
        const reqNames = new Set(reqItems.map(i => i.name));

        const badgesHTML = apdItemsList.map(item => {
          const isReq = reqNames.has(item.name);
          const isUsed = r[item.name];

          if (!isReq) {
            return `<span class="badge" style="background:#e2e8f0; color:#94a3b8; font-size: 0.75rem; padding: 3px 6px; cursor: help; min-width: 24px; text-align: center;" title="${item.label}: Tidak Wajib">${item.abbr}</span>`;
          }

          const badgeClass = isUsed ? 'badge-success' : 'badge-danger';
          const labelVal = isUsed ? 'Ya (Patuh)' : 'Tidak (Tidak Patuh)';
          return `<span class="badge ${badgeClass}" style="font-size: 0.75rem; padding: 3px 6px; cursor: help; min-width: 24px; text-align: center;" title="${item.label} (WAJIB): ${labelVal}">${item.abbr}</span>`;
        }).join('');

        return `<div style="display: flex; gap: 4px; flex-wrap: nowrap; justify-content: start;">${badgesHTML}</div>`;
      }
    },
    {
      label: 'Capaian APD',
      width: '110px',
      align: 'center',
      render: (r) => {
        const reqItems = getRequiredItemsForRecord(r);
        const yaCount = reqItems.filter(i => r[i.name] === true).length;
        const totalWajib = reqItems.length;
        const isCompliant = yaCount === totalWajib;
        return `
          <div style="font-size: 0.85rem;">
            <strong>${yaCount}/${totalWajib} APD</strong>
            <div>${isCompliant ? '<span class="badge badge-success" style="font-size:0.7rem;">Sesuai 100%</span>' : '<span class="badge badge-danger" style="font-size:0.7rem;">Tidak Sesuai</span>'}</div>
          </div>
        `;
      }
    }
  ],

  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    {
      name: 'profesi',
      label: 'Profesi',
      type: 'select',
      options: [
        { value: 'Dokter', label: 'Dokter' },
        { value: 'Perawat', label: 'Perawat' },
        { value: 'Bidan', label: 'Bidan' },
        { value: 'Nakes Lain', label: 'Nakes Lain' }
      ],
      required: true,
      row: 2
    },
    {
      name: 'tindakan',
      label: 'Tindakan',
      type: 'custom',
      row: 2,
      render: (val, data) => {
        const selectedValue = data?.tindakan || '';
        const optionsHTML = masterTindakanOptions.map(item => `
          <option value="${item.nama}" ${selectedValue === item.nama ? 'selected' : ''}>${item.nama}</option>
        `).join('');
        return `
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Tindakan <span class="required">*</span></label>
            <select name="tindakan" id="select-tindakan-apd" class="form-control" required>
              <option value="">-- Pilih Tindakan --</option>
              ${optionsHTML}
            </select>
          </div>
        `;
      }
    },
    {
      name: 'apd_items',
      label: 'Item APD yang dipakai',
      type: 'custom',
      row: 3,
      render: (val, data) => {
        const selectedTindakan = data?.tindakan || '';
        const master = masterTindakanOptions.find(m => m.nama === selectedTindakan);

        const rowsHTML = apdItemsList.map(item => {
          const currentVal = data ? data[item.name] : false;
          const isReq = master ? (master[item.reqKey] === true) : true;
          return `
            <tr style="border-bottom: 1px solid var(--border-color, #dee2e6);">
              <td style="padding: 10px 0; font-weight: 500;">
                ${item.label}
                <span id="tag-req-${item.name}" class="badge ${isReq ? 'badge-warning' : 'badge-info'}" style="font-size: 0.7rem; margin-left: 6px;">
                  ${isReq ? 'Wajib' : 'Tidak Wajib'}
                </span>
              </td>
              <td style="padding: 10px; text-align: center;">
                <label style="margin-right: 24px; cursor: pointer; font-weight: 500;">
                  <input type="radio" name="${item.name}" value="true" ${currentVal === true ? 'checked' : ''} required> Ya
                </label>
                <label style="cursor: pointer; font-weight: 500;">
                  <input type="radio" name="${item.name}" value="false" ${currentVal === false ? 'checked' : (data ? '' : 'checked')}> Tidak
                </label>
              </td>
            </tr>
          `;
        }).join('');
        return `
          <div class="form-group" style="flex: 1; margin-top: 16px;">
            <label class="form-label" style="font-weight: 600; margin-bottom: 12px; font-size: 1.05rem;">Checklist Item APD Petugas <span class="required">*</span></label>
            <div style="background: var(--bg-light, #f8f9fa); padding: 16px; border-radius: 8px; border: 1px dashed var(--border-color, #dee2e6);">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-color, #dee2e6); text-align: left;">
                    <th style="padding-bottom: 8px; color: var(--text-light); font-weight: 600;">Item APD</th>
                    <th style="padding-bottom: 8px; text-align: center; color: var(--text-light); width: 200px; font-weight: 600;">Pilihan (Ya / Tidak)</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHTML}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
    }
  ],

  beforeSubmit: (formData) => {
    formData.penutup_kepala = formData.penutup_kepala === 'true';
    formData.face_shield = formData.face_shield === 'true';
    formData.masker = formData.masker === 'true';
    formData.apron = formData.apron === 'true';
    formData.coverall = formData.coverall === 'true';
    formData.sarung_tangan = formData.sarung_tangan === 'true';
    formData.cover_shoes = formData.cover_shoes === 'true';
  },

  calculateSummaryHTML: (s) => {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Transaksi</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.numerator || 0}</div>
        <div class="summary-label">APD Dipakai (N)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.denominator || 0}</div>
        <div class="summary-label">APD Wajib Indikasi (D)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Kepatuhan APD</div>
      </div>
      <div class="summary-item">
        ${renderBadge(s.persen || 0, '100')}
        <div class="summary-label" style="margin-top:8px">Standar: ${s.standar || '100%'}</div>
      </div>
    `;
  }
});

const originalRender = pageObj.render;
pageObj.render = async (container) => {
  await loadMasterTindakanOptions();
  await originalRender(container);

  // Bind change event to update APD requirements tag in modal form dynamically
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'select-tindakan-apd') {
      const selectedName = e.target.value;
      const master = masterTindakanOptions.find(m => m.nama === selectedName);

      apdItemsList.forEach(item => {
        const isReq = master ? (master[item.reqKey] === true) : true;
        const tagEl = document.getElementById(`tag-req-${item.name}`);
        if (tagEl) {
          if (isReq) {
            tagEl.className = 'badge badge-warning';
            tagEl.innerText = 'Wajib';
          } else {
            tagEl.className = 'badge badge-info';
            tagEl.innerText = 'Tidak Wajib';
          }
        }
      });
    }
  });
};

export default pageObj;
