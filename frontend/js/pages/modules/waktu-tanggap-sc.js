import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime } from '../../utils/formatter.js';

export default createGenericIndicatorPage({
  title: 'Waktu Tanggap SC Emergency',
  subtitle: 'Pencatatan waktu tanggap emergency SC dari keputusan sampai sayatan pertama',
  endpoint: '/waktu-tanggap-sc',
  metricType: 'compliance',
  metricLabel: 'Kepatuhan Waktu Tanggap',
  numeratorLabel: 'Tepat Waktu / Sesuai Standar (N)',
  denominatorLabel: 'Total Pasien SC Emergency (D)',

  hasSummaryData: true,
  summaryDataTitle: 'Parameter Waktu Tanggap SC Emergency',
  summaryDataInfo: 'Masukkan standar maksimal menit/jam waktu tunggu SC Emergency (default: 30 menit) dan total populasi seluruh pasien SC emergency pada periode ini sebagai Denominator (D). Indikator menghitung persentase pasien dengan waktu tanggap (dari keputusan operasi sampai sayatan pertama) yang memenuhi standar (≤ batas waktu).',
  summaryDataModalTitle: 'Edit Parameter Waktu Tanggap SC Emergency',
  summaryDataFields: [
    { name: 'total_pasien', label: 'Total Pasien SC Emergency', type: 'number', unit: 'Pasien' },
    { name: 'standar_menit', label: 'Batas Maksimal Menit Waktu Tunggu', type: 'number', unit: 'Menit' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Diagnosis', key: 'diagnosis' },
    { label: 'Jam Keputusan', key: 'jam_ditentukan_operasi', render: (r) => formatTime(r.jam_ditentukan_operasi) },
    { label: 'Jam Sayatan', key: 'jam_sayatan_pertama', render: (r) => formatTime(r.jam_sayatan_pertama) },
    { 
      label: 'Selisih (mnt)', 
      render: (r) => {
        const threshold = r.standar_menit !== undefined ? r.standar_menit : 30;
        const badge = r.selisih_menit <= threshold ? 'badge-success' : 'badge-danger';
        return `<span class="badge ${badge}">${r.selisih_menit} mnt</span>`;
      } 
    },
    {
      label: 'Status Kepatuhan',
      render: (r) => {
        const threshold = r.standar_menit !== undefined ? r.standar_menit : 30;
        return r.selisih_menit <= threshold
          ? '<span class="badge badge-success">Sesuai Standar</span>'
          : `<span class="badge badge-danger">Melebihi (${r.selisih_menit}m > ${threshold}m)</span>`;
      }
    }
  ],
  rowClass: (r) => {
    return r.patuh ? '' : 'row-danger';
  },

  beforeSubmit(formData) {
    const form = document.getElementById('modul-form');
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const decH = form.querySelector('#dec_hour')?.value || '';
    const decM = form.querySelector('#dec_minute')?.value || '';
    const decVal = (decH && decM) ? `${decH}:${decM}` : '';
    formData.jam_ditentukan_operasi = decVal;
    
    const decInput = form.querySelector('#jam_ditentukan_operasi');
    if (decInput) decInput.value = decVal;

    const incH = form.querySelector('#inc_hour')?.value || '';
    const incM = form.querySelector('#inc_minute')?.value || '';
    const incVal = (incH && incM) ? `${incH}:${incM}` : '';
    formData.jam_sayatan_pertama = incVal;
    
    const incInput = form.querySelector('#jam_sayatan_pertama');
    if (incInput) incInput.value = incVal;

    if (!decVal) {
      form.querySelector('#dec_hour')?.classList.add('is-invalid');
      form.querySelector('#dec_minute')?.classList.add('is-invalid');
    }
    if (!incVal) {
      form.querySelector('#inc_hour')?.classList.add('is-invalid');
      form.querySelector('#inc_minute')?.classList.add('is-invalid');
    }
  },

  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'diagnosis', label: 'Diagnosis', type: 'text', required: true, row: 2 },
    {
      name: 'jam_ditentukan_operasi',
      label: 'Jam Keputusan Operasi (HH:MM)',
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
            <label class="form-label">Jam Keputusan Operasi (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="dec_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="dec_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_ditentukan_operasi" id="jam_ditentukan_operasi" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'jam_sayatan_pertama',
      label: 'Jam Sayatan Pertama (HH:MM)',
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
            <label class="form-label">Jam Sayatan Pertama (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="inc_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="inc_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_sayatan_pertama" id="jam_sayatan_pertama" value="${timeStr}">
          </div>
        `;
      }
    }
  ]
});
