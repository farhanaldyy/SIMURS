import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime } from '../../utils/formatter.js';

export default createGenericIndicatorPage({
  title: 'Angka Kematian Ranap',
  subtitle: 'Pencatatan kasus kematian pasien rawat inap',
  endpoint: '/angka-kematian-ranap',
  metricType: 'count',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Tgl Masuk', key: 'tanggal_masuk', render: (r) => new Date(r.tanggal_masuk).toLocaleDateString('id-ID') },
    { label: 'Jam Masuk', key: 'jam_masuk', render: (r) => formatTime(r.jam_masuk) },
    { label: 'Tgl Keluar/Wafat', key: 'tanggal_keluar', render: (r) => new Date(r.tanggal_keluar).toLocaleDateString('id-ID') },
    { label: 'Jam Keluar/Wafat', key: 'jam_keluar', render: (r) => formatTime(r.jam_keluar) },
    { label: 'Keterangan', key: 'keterangan' }
  ],
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

    const keluarH = form.querySelector('#keluar_hour').value;
    const keluarM = form.querySelector('#keluar_minute').value;
    const keluarVal = (keluarH && keluarM) ? `${keluarH}:${keluarM}` : '';
    formData.jam_keluar = keluarVal;
    
    const keluarInput = form.querySelector('#jam_keluar');
    if (keluarInput) keluarInput.value = keluarVal;

    if (!masukVal) {
      form.querySelector('#masuk_hour').classList.add('is-invalid');
      form.querySelector('#masuk_minute').classList.add('is-invalid');
    }
    if (!keluarVal) {
      form.querySelector('#keluar_hour').classList.add('is-invalid');
      form.querySelector('#keluar_minute').classList.add('is-invalid');
    }
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'tanggal_masuk', label: 'Tanggal Masuk', type: 'date', required: true, row: 2 },
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
    { name: 'tanggal_keluar', label: 'Tanggal Keluar/Wafat', type: 'date', required: true, row: 3 },
    {
      name: 'jam_keluar',
      label: 'Jam Keluar/Wafat (HH:MM)',
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
            <label class="form-label">Jam Keluar/Wafat (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="keluar_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="keluar_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_keluar" id="jam_keluar" value="${timeStr}">
          </div>
        `;
      }
    },
    { name: 'keterangan', label: 'Penyebab/Keterangan', type: 'text', required: false, row: 4 }
  ]
});
