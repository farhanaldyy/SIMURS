import { createGenericIndicatorPage } from './generic-indicator.js';
import { formatTime } from '../../utils/formatter.js';

export default createGenericIndicatorPage({
  title: 'Emergency Response Time',
  subtitle: 'Waktu tanggap pelayanan dokter spesialis/umum di IGD',
  endpoint: '/emergency-response-time',
  metricType: 'average',
  numeratorLabel: 'Patuh (N)',
  columns: [
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Triase', key: 'triase', render: (r) => `<span class="badge triase-${r.triase.toLowerCase()}">${r.triase}</span>` },
    { label: 'Jam Datang', key: 'jam_datang', render: (r) => formatTime(r.jam_datang) },
    { label: 'Dilayani Dokter', key: 'jam_dilayani_dokter', render: (r) => formatTime(r.jam_dilayani_dokter) },
    { label: 'Selisih (Menit)', key: 'respon_time_menit', render: (r) => `${r.respon_time_menit} Menit` }
  ],
  rowClass: (r) => parseFloat(r.respon_time_menit) <= 5 ? '' : 'row-danger',
  beforeSubmit(formData) {
    const form = document.getElementById('modul-form');
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    const datangH = form.querySelector('#datang_hour').value;
    const datangM = form.querySelector('#datang_minute').value;
    const datangVal = (datangH && datangM) ? `${datangH}:${datangM}` : '';
    formData.jam_datang = datangVal;
    
    const datangInput = form.querySelector('#jam_datang');
    if (datangInput) datangInput.value = datangVal;

    const dokterH = form.querySelector('#dokter_hour').value;
    const dokterM = form.querySelector('#dokter_minute').value;
    const dokterVal = (dokterH && dokterM) ? `${dokterH}:${dokterM}` : '';
    formData.jam_dilayani_dokter = dokterVal;
    
    const dokterInput = form.querySelector('#jam_dilayani_dokter');
    if (dokterInput) dokterInput.value = dokterVal;

    if (!datangVal) {
      form.querySelector('#datang_hour').classList.add('is-invalid');
      form.querySelector('#datang_minute').classList.add('is-invalid');
    }
    if (!dokterVal) {
      form.querySelector('#dokter_hour').classList.add('is-invalid');
      form.querySelector('#dokter_minute').classList.add('is-invalid');
    }
  },
  fields: [
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    {
      name: 'jam_datang',
      label: 'Jam Datang (HH:MM)',
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
            <label class="form-label">Jam Datang (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="datang_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="datang_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_datang" id="jam_datang" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'jam_dilayani_dokter',
      label: 'Jam Dilayani Dokter (HH:MM)',
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
            <label class="form-label">Jam Dilayani Dokter (HH:MM) <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="dokter_hour" class="form-control" style="flex: 1;">
                <option value="">Jam</option>
                ${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => `
                  <option value="${h}" ${hVal === h ? 'selected' : ''}>${h}</option>
                `).join('')}
              </select>
              <select id="dokter_minute" class="form-control" style="flex: 1;">
                <option value="">Menit</option>
                ${Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => `
                  <option value="${m}" ${mVal === m ? 'selected' : ''}>${m}</option>
                `).join('')}
              </select>
            </div>
            <input type="hidden" name="jam_dilayani_dokter" id="jam_dilayani_dokter" value="${timeStr}">
          </div>
        `;
      }
    },
    {
      name: 'triase',
      label: 'Triase',
      type: 'select',
      required: true,
      options: [
        { value: 'Merah', label: 'Merah (Resusitasi/Gawat Darurat)' },
        { value: 'Kuning', label: 'Kuning (Mendesak)' },
        { value: 'Hijau', label: 'Hijau (Biasa)' },
        { value: 'Hitam', label: 'Hitam (Meninggal)' }
      ],
      row: 3
    }
  ]
});
