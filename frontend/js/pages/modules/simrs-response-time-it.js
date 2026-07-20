import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime, formatDate } from '../../utils/formatter.js';
import { renderBadge } from '../../components/indicator-badge.js';
import { showToast } from '../../components/toast.js';
import { showModal, closeModal } from '../../components/modal.js';
import { api } from '../../api/client.js';
import Store from '../../store.js';
import { getUnits } from '../../api/master.js';

const page = createGenericIndicatorPage({
  title: 'Response Time SIMRS IT',
  subtitle: 'Pelaporan dan evaluasi kecepatan penanganan masalah IT SIMRS',
  endpoint: '/simrs-response-time-it',
  infoCardHTML: `
    <div class="card" style="margin-bottom: 14px; border-left: 4px solid var(--color-primary); background: #f8fafc; padding: 12px 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <div style="font-weight: 700; font-size: 0.95rem; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 1.1rem;">💡</span> <span>Panduan Penggunaan & Import Data Response Time IT</span>
          <span class="badge badge-primary" style="font-size: 0.7rem; padding: 2px 8px; margin-left: 4px;">Standar ≤ 15 Mnt</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-outline btn-sm" id="btn-download-template">📄 Template Excel</button>
          <button class="btn btn-success btn-sm" id="btn-import-excel">📥 Import Excel</button>
          <input type="file" id="file-import-excel" accept=".xlsx, .xls" style="display: none;">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.8rem; color: #475569;">
        <div style="background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">1. Unduh Template</strong>
          Klik <strong>📄 Template Excel</strong> untuk format resmi + sheet Referensi Data Unit/Petugas.
        </div>
        <div style="background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">2. Isi Spreadsheet</strong>
          Isi <code style="background:#f1f5f9;padding:1px 4px;">Tanggal</code>, <code style="background:#f1f5f9;padding:1px 4px;">Unit</code>, <code style="background:#f1f5f9;padding:1px 4px;">Permasalahan</code>, <code style="background:#f1f5f9;padding:1px 4px;">Jam Laporan/Tindakan</code> (HH:MM).
        </div>
        <div style="background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">3. Import & Validasi</strong>
          Pilih Periode Aktif & Unit di atas, klik <strong>📥 Import Excel</strong>. Sistem akan mengecek validitas data.
        </div>
        <div style="background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">4. Input Manual</strong>
          Gunakan <strong>+ Tambah Data</strong> untuk menginput per record langsung di aplikasi.
        </div>
      </div>
    </div>
  `,
  onMount(reloadFn) {
    const downloadBtn = document.getElementById('btn-download-template');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        api.download('/simrs-response-time-it/template-excel', 'Template_Import_Response_Time_SIMRS_IT.xlsx');
      });
    }

    const importBtn = document.getElementById('btn-import-excel');
    const fileInput = document.getElementById('file-import-excel');

    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!Store.periodeAktif) {
          showToast('Pilih periode terlebih dahulu sebelum mengimpor data', 'warning');
          e.target.value = '';
          return;
        }

        const selectedUnitId = Store.unitAktif ? Store.unitAktif.id : (Store.user ? Store.user.unit_id : 1);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('periode_id', Store.periodeAktif.id);
        if (selectedUnitId) formData.append('unit_id', selectedUnitId);

        showToast('Mengimpor data Excel...', 'info');
        const res = await api.upload('/simrs-response-time-it/import-excel', formData);

        if (res.errors && res.errors.length > 0) {
          const errorListHTML = res.errors.map(err => `<li style="margin-bottom: 4px; color: #dc2626;">${err}</li>`).join('');
          
          showModal('Hasil Validasi Import Excel', `
            <div style="font-size: 0.9rem;">
              <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <div style="background: #dcfce7; color: #166534; padding: 10px 14px; border-radius: 8px; flex: 1;">
                  <strong>✓ Data Berhasil:</strong> ${res.importedCount || 0}
                </div>
                <div style="background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; flex: 1;">
                  <strong>✕ Data Gagal (Tidak Valid):</strong> ${res.failedCount || 0}
                </div>
              </div>
              <div style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Rincian Catatan Validasi:</div>
              <div style="max-height: 200px; overflow-y: auto; background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 8px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 0.82rem;">
                  ${errorListHTML}
                </ul>
              </div>
            </div>
          `, {
            confirmText: 'Tutup',
            onConfirm: async () => {
              closeModal();
              if (res.importedCount > 0) reloadFn();
            }
          });
        } else if (res.success) {
          showToast(res.message || 'Import data berhasil diselesaikan', 'success');
          reloadFn();
        } else {
          showToast(res.message || 'Gagal mengimpor data Excel', 'error');
        }

        e.target.value = '';
      });
    }
  },
  columns: [
    { label: 'Tanggal', key: 'tanggal', render: (r) => formatDate(r.tanggal) },
    { label: 'Unit Diperbaiki', key: 'unit_diperbaiki', render: (r) => r.unit_diperbaiki || '-' },
    { label: 'Permasalahan', key: 'permasalahan' },
    { label: 'Jam Laporan', key: 'jam_laporan', render: (r) => formatTime(r.jam_laporan) },
    { label: 'Jam Tindakan', key: 'jam_tindakan', render: (r) => formatTime(r.jam_tindakan) },
    { label: 'Response Time', key: 'response_time_menit', render: (r) => `<strong>${r.response_time_menit || 0}</strong> Mnt` },
    { 
      label: 'Status', 
      key: 'status', 
      render: (r) => {
        let badgeClass = 'badge-success';
        if (r.status === 'Belum Selesai') badgeClass = 'badge-danger';
        else if (r.status === 'Lainnya') badgeClass = 'badge-warning';
        return `<span class="badge ${badgeClass}">${r.status}</span>`;
      } 
    },
    { label: 'Petugas', key: 'petugas' }
  ],
  rowClass: (r) => (r.response_time_menit || 0) <= 15 ? '' : 'row-danger',
  beforeSubmit(formData) {
    const form = document.getElementById('modul-form');
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const lapH = form.querySelector('#laporan_hour').value;
    const lapM = form.querySelector('#laporan_minute').value;
    const lapVal = (lapH && lapM) ? `${lapH}:${lapM}` : '';
    formData.jam_laporan = lapVal;
    
    const lapInput = form.querySelector('#jam_laporan');
    if (lapInput) lapInput.value = lapVal;

    const tindH = form.querySelector('#tindakan_hour').value;
    const tindM = form.querySelector('#tindakan_minute').value;
    const tindVal = (tindH && tindM) ? `${tindH}:${tindM}` : '';
    formData.jam_tindakan = tindVal;
    
    const tindInput = form.querySelector('#jam_tindakan');
    if (tindInput) tindInput.value = tindVal;

    if (!lapVal) {
      form.querySelector('#laporan_hour').classList.add('is-invalid');
      form.querySelector('#laporan_minute').classList.add('is-invalid');
    }
    if (!tindVal) {
      form.querySelector('#tindakan_hour').classList.add('is-invalid');
      form.querySelector('#tindakan_minute').classList.add('is-invalid');
    }
  },
  fields: [
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true, row: 1 },
    {
      name: 'unit_diperbaiki',
      label: 'Unit Diperbaiki',
      type: 'custom',
      required: true,
      row: 1,
      render: (val, data) => {
        const units = Store.unitList || [];
        const selectedVal = val || (data ? data.unit_diperbaiki : '');
        
        const optionsHTML = units.map(u => `
          <option value="${u.nama_unit}" ${selectedVal === u.nama_unit ? 'selected' : ''}>${u.nama_unit}</option>
        `).join('');

        return `
          <div class="form-group">
            <label class="form-label">Unit Diperbaiki <span class="required">*</span></label>
            <select name="unit_diperbaiki" class="form-control" required>
              <option value="">-- Pilih Unit Diperbaiki --</option>
              ${optionsHTML}
            </select>
          </div>
        `;
      }
    },
    { name: 'permasalahan', label: 'Permasalahan', type: 'text', required: true, row: 2 },
    {
      name: 'jam_laporan',
      label: 'Jam Laporan (HH:MM)',
      type: 'custom',
      required: true,
      row: 3,
      render: (val) => {
        const formatted = val ? formatTime(val) : '';
        const timeStr = formatted === '-' ? '' : formatted;
        const hVal = timeStr.includes(':') ? timeStr.split(':')[0] : '';
        const mVal = timeStr.includes(':') ? timeStr.split(':')[1] : '';
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Laporan (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="laporan_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="laporan_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_laporan" id="jam_laporan" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'jam_tindakan',
      label: 'Jam Tindakan (HH:MM)',
      type: 'custom',
      required: true,
      row: 3,
      render: (val) => {
        const formatted = val ? formatTime(val) : '';
        const timeStr = formatted === '-' ? '' : formatted;
        const hVal = timeStr.includes(':') ? timeStr.split(':')[0] : '';
        const mVal = timeStr.includes(':') ? timeStr.split(':')[1] : '';
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Tindakan (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="tindakan_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="tindakan_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_tindakan" id="jam_tindakan" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Selesai', label: 'Selesai' },
        { value: 'Belum Selesai', label: 'Belum Selesai' },
        { value: 'Lainnya', label: 'Lainnya' }
      ],
      row: 4
    },
    {
      name: 'petugas',
      label: 'Petugas',
      type: 'select',
      required: true,
      options: [
        { value: 'Muhamad Sarip', label: 'Muhamad Sarip' },
        { value: 'Panji Prasetyo', label: 'Panji Prasetyo' },
        { value: 'Farhan Aldiansyah', label: 'Farhan Aldiansyah' }
      ],
      row: 4
    }
  ],
  calculateSummaryHTML: (s) => {
    const totalData = s.total || 0;
    const totalJam = s.totalJam || 0;
    const hasilResponseTime = s.hasilResponseTime || 0;
    const presentase = s.presentase || 0;
    const rataRataMenit = s.rataRataMenit || 0;
    const standar = s.standar || '≤ 15 Menit';
    
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item">
          <div class="summary-value">${totalData}</div>
          <div class="summary-label">Total Data</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${totalJam} Jam</div>
          <div class="summary-label">Total Jam</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${hasilResponseTime}</div>
          <div class="summary-label">Hasil Response Time (Jam/Data)</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${rataRataMenit} Menit</div>
          <div class="summary-label">Rata-Rata Response Time</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${presentase}%</div>
          <div class="summary-label">Presentase</div>
        </div>
        <div class="summary-item">
          ${renderBadge(rataRataMenit, '≤ 15')}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
    `;
  }
});

export default {
  ...page,
  async render(container) {
    if (!Store.unitList || Store.unitList.length === 0) {
      const res = await getUnits();
      if (res.success) Store.unitList = res.data;
    }
    await page.render(container);
  }
};
