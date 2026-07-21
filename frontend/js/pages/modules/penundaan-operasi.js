import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime } from '../../utils/formatter.js';

export default createGenericIndicatorPage({
  title: 'Penundaan Operasi Elektif',
  subtitle: 'Pencatatan penundaan waktu pelaksanaan operasi elektif (> 1 Jam / 60 Menit)',
  endpoint: '/penundaan-operasi',
  ignoreUnit: true,
  metricType: 'compliance',
  hasSummaryData: true,
  summaryDataFields: [
    { name: 'standar_menit', label: 'Batas Menit Penundaan', type: 'number' }
  ],
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'DPJP Bedah', key: 'dpjp' },
    { label: 'Tanggal', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID') },
    { label: 'Jadwal Operasi', key: 'jadwal_jam_operasi', render: (r) => formatTime(r.jadwal_jam_operasi) },
    { label: 'Mulai Operasi', key: 'jam_mulai_operasi', render: (r) => r.batal ? '<span class="text-danger" style="font-weight: 500;">Dibatalkan</span>' : formatTime(r.jam_mulai_operasi) },
    { 
      label: 'Status Penundaan', 
      render: (r) => {
        if (r.indikasi_medis) return '<span class="badge badge-success">Sesuai (Indikasi Medis)</span>';
        if (r.batal) return '<span class="badge badge-danger">Tertunda (Dibatalkan)</span>';
        const threshold = r.standar_menit !== undefined ? r.standar_menit : 60;
        if (r.waktu_tunggu_menit > threshold) return `<span class="badge badge-danger">Tertunda (${r.waktu_tunggu_menit} Menit)</span>`;
        return `<span class="badge badge-success">Tepat Waktu (${r.waktu_tunggu_menit} Menit)</span>`;
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

    const jadwalH = form.querySelector('#jadwal_hour').value;
    const jadwalM = form.querySelector('#jadwal_minute').value;
    const jadwalVal = (jadwalH && jadwalM) ? `${jadwalH}:${jadwalM}` : '';
    formData.jadwal_jam_operasi = jadwalVal;
    
    const jadwalInput = form.querySelector('#jadwal_jam_operasi');
    if (jadwalInput) jadwalInput.value = jadwalVal;

    const mulaiH = form.querySelector('#mulai_hour').value;
    const mulaiM = form.querySelector('#mulai_minute').value;
    const mulaiVal = (mulaiH && mulaiM) ? `${mulaiH}:${mulaiM}` : '';
    formData.jam_mulai_operasi = mulaiVal;
    
    const mulaiInput = form.querySelector('#jam_mulai_operasi');
    if (mulaiInput) mulaiInput.value = mulaiVal;

    if (!jadwalVal) {
      form.querySelector('#jadwal_hour').classList.add('is-invalid');
      form.querySelector('#jadwal_minute').classList.add('is-invalid');
    }
    if (!mulaiVal) {
      form.querySelector('#mulai_hour').classList.add('is-invalid');
      form.querySelector('#mulai_minute').classList.add('is-invalid');
    }
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'dpjp', label: 'DPJP Bedah', type: 'text', required: true, row: 2 },
    { name: 'tanggal', label: 'Tanggal Operasi', type: 'date', required: true, row: 2 },
    {
      name: 'jadwal_jam_operasi',
      label: 'Jadwal Jam Operasi (HH:MM)',
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
            <label class="form-label">Jadwal Jam Operasi (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="jadwal_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="jadwal_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jadwal_jam_operasi" id="jadwal_jam_operasi" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'jam_mulai_operasi',
      label: 'Jam Mulai Operasi Aktual (HH:MM)',
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
            <label class="form-label">Jam Mulai Operasi Aktual (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="mulai_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="mulai_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_mulai_operasi" id="jam_mulai_operasi" value="${timeStr}">
          </div>
        `;
      }
    },
    { name: 'batal', label: 'Operasi Dibatalkan?', type: 'boolean', required: false, row: 4 },
    { name: 'indikasi_medis', label: 'Ada Indikasi Medis Mendesak?', type: 'boolean', required: false, row: 4 }
  ]
});
