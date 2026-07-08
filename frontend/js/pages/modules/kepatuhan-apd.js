import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { api } from '../../api/client.js';

let masterTindakanOptions = [];

async function loadMasterTindakanOptions() {
  const res = await api.get('/master-tindakan?all=true');
  if (res.success) {
    masterTindakanOptions = res.data;
  }
}

const pageObj = createGenericIndicatorPage({
  title: 'Kepatuhan Penggunaan APD',
  subtitle: 'Kepatuhan penggunaan Alat Pelindung Diri (APD) pada petugas sesuai dengan standar keselamatan',
  endpoint: '/kepatuhan-apd',
  metricType: 'compliance',
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'Profesi', key: 'profesi' },
    { label: 'Tindakan', key: 'tindakan' },
    {
      label: 'Status APD',
      render: (r) => {
        const items = [
          { name: 'penutup_kepala', abbr: 'PK', label: 'Penutup Kepala' },
          { name: 'face_shield', abbr: 'FS', label: 'Face Shield' },
          { name: 'masker', abbr: 'M', label: 'Masker' },
          { name: 'apron', abbr: 'A', label: 'Apron' },
          { name: 'coverall', abbr: 'C', label: 'Coverall' },
          { name: 'sarung_tangan', abbr: 'ST', label: 'Sarung Tangan' },
          { name: 'cover_shoes', abbr: 'CS', label: 'Cover Shoes' }
        ];

        const badgesHTML = items.map(item => {
          const isUsed = r[item.name];
          const badgeClass = isUsed ? 'badge-success' : 'badge-danger';
          const labelVal = isUsed ? 'Ya' : 'Tidak';
          return `<span class="badge ${badgeClass}" style="font-size: 0.75rem; padding: 3px 6px; cursor: help; min-width: 24px; text-align: center;" title="${item.label}: ${labelVal}">${item.abbr}</span>`;
        }).join('');

        return `<div style="display: flex; gap: 4px; flex-wrap: nowrap; justify-content: start;">${badgesHTML}</div>`;
      }
    },
    {
      label: 'Ya',
      render: (r) => {
        return [
          r.penutup_kepala,
          r.face_shield,
          r.masker,
          r.apron,
          r.coverall,
          r.sarung_tangan,
          r.cover_shoes
        ].filter(Boolean).length;
      }
    },
    {
      label: 'Tidak',
      render: (r) => {
        const ya = [
          r.penutup_kepala,
          r.face_shield,
          r.masker,
          r.apron,
          r.coverall,
          r.sarung_tangan,
          r.cover_shoes
        ].filter(Boolean).length;
        return 7 - ya;
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
            <select name="tindakan" class="form-control" required>
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
        const items = [
          { name: 'penutup_kepala', label: 'Penutup Kepala' },
          { name: 'face_shield', label: 'Face Shield' },
          { name: 'masker', label: 'Masker' },
          { name: 'apron', label: 'Apron' },
          { name: 'coverall', label: 'Coverall' },
          { name: 'sarung_tangan', label: 'Sarung Tangan' },
          { name: 'cover_shoes', label: 'Cover Shoes' }
        ];
        const rowsHTML = items.map(item => {
          const currentVal = data ? data[item.name] : false;
          return `
            <tr style="border-bottom: 1px solid var(--border-color, #dee2e6);">
              <td style="padding: 10px 0; font-weight: 500;">${item.label}</td>
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
            <label class="form-label" style="font-weight: 600; margin-bottom: 12px; font-size: 1.05rem;">Item APD yang dipakai <span class="required">*</span></label>
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
        <div class="summary-label">Total Data</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.numerator || 0}</div>
        <div class="summary-label">Total Ya</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.denominator || 0}</div>
        <div class="summary-label">Total Tidak</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.persen || 0}%</div>
        <div class="summary-label">Persentase Kepatuhan</div>
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
};

export default pageObj;
