import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime } from '../../utils/formatter.js';

export default createGenericIndicatorPage({
  title: 'Pasien Tertahan IGD',
  subtitle: 'Waktu tunggu pasien di IGD sebelum dipindahkan ke ruangan (> 6 jam atau 240 menit)',
  endpoint: '/pasien-tertahan-igd',
  metricType: 'average',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Jam Masuk', key: 'jam_masuk', render: (r) => new Date(r.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Pindah Ruangan', key: 'jam_pindah_ruangan', render: (r) => new Date(r.jam_pindah_ruangan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Waktu Tunggu', key: 'waktu_tunggu_menit', render: (r) => `${r.waktu_tunggu_menit} Menit` },
    { label: 'Keterangan', key: 'keterangan' }
  ],
  rowClass: (r) => r.waktu_tunggu_menit <= 240 ? '' : 'row-danger',
  beforeSubmit(formData) {
    const form = document.getElementById('modul-form');
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const masukH = form.querySelector('#masuk_hour').value;
    const masukM = form.querySelector('#masuk_minute').value;
    const masukVal = (masukH && masukM) ? `${masukH}:${masukM}` : '';
    formData.jam_masuk = masukVal;
    
    const masukInput = form.querySelector('#jam_masuk');
    if (masukInput) masukInput.value = masukVal;

    const pindahH = form.querySelector('#pindah_hour').value;
    const pindahM = form.querySelector('#pindah_minute').value;
    const pindahVal = (pindahH && pindahM) ? `${pindahH}:${pindahM}` : '';
    formData.jam_pindah_ruangan = pindahVal;
    
    const pindahInput = form.querySelector('#jam_pindah_ruangan');
    if (pindahInput) pindahInput.value = pindahVal;

    if (!masukVal) {
      form.querySelector('#masuk_hour').classList.add('is-invalid');
      form.querySelector('#masuk_minute').classList.add('is-invalid');
    }
    if (!pindahVal) {
      form.querySelector('#pindah_hour').classList.add('is-invalid');
      form.querySelector('#pindah_minute').classList.add('is-invalid');
    }
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    {
      name: 'jam_masuk',
      label: 'Jam Masuk (HH:MM)',
      type: 'custom',
      required: true,
      row: 2,
      render: (val) => {
        const formatted = val ? formatTime(val) : '';
        const timeStr = formatted === '-' ? '' : formatted;
        const hVal = timeStr.includes(':') ? timeStr.split(':')[0] : '';
        const mVal = timeStr.includes(':') ? timeStr.split(':')[1] : '';
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Masuk (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="masuk_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="masuk_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_masuk" id="jam_masuk" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'jam_pindah_ruangan',
      label: 'Jam Pindah Ruangan (HH:MM)',
      type: 'custom',
      required: true,
      row: 2,
      render: (val) => {
        const formatted = val ? formatTime(val) : '';
        const timeStr = formatted === '-' ? '' : formatted;
        const hVal = timeStr.includes(':') ? timeStr.split(':')[0] : '';
        const mVal = timeStr.includes(':') ? timeStr.split(':')[1] : '';
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Pindah Ruangan (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="pindah_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="pindah_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_pindah_ruangan" id="jam_pindah_ruangan" value="${timeStr}">
          </div>
        `;
      }
    },
    { name: 'keterangan', label: 'Alasan Tertahan/Keterangan', type: 'text', required: false, row: 3 }
  ]
});
