import { createGenericIndicatorPage } from './generic-indicator.js';

const page = createGenericIndicatorPage({
  title: 'Jadwal Dokter Radiologi',
  subtitle: 'Konfigurasi Jadwal Dokter Spesialis Radiologi',
  endpoint: '/radiologi-jadwal-dokter',
  columns: [
    { label: 'Hari', key: 'hari' },
    {
      label: 'Jam Praktek',
      render: (r) => `${r.jam_mulai} - ${r.jam_selesai}`
    }
  ],
  fields: [
    {
      name: 'hari',
      label: 'Hari',
      type: 'custom',
      required: true,
      row: 1,
      render: (val) => {
        const days = ['Senin - Sabtu', 'Senin - Jumat', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const options = days.map(d => `<option value="${d}" ${val === d ? 'selected' : ''}>${d}</option>`).join('');
        return `
          <div class="form-group">
            <label class="form-label">Hari <span class="required">*</span></label>
            <select name="hari" class="form-control" required>
              <option value="" disabled ${!val ? 'selected' : ''}>-- Pilih Hari --</option>
              ${options}
            </select>
          </div>
        `;
      }
    },
    {
      name: 'jam_mulai',
      label: 'Jam Mulai',
      type: 'custom',
      required: true,
      row: 2,
      render: (val) => {
        let h = '14';
        let m = '00';
        if (val && val.includes('.')) {
          const parts = val.split('.');
          h = parts[0].padStart(2, '0');
          m = parts[1].padStart(2, '0');
        }
        
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        
        const hOptions = hours.map(hr => `<option value="${hr}" ${h === hr ? 'selected' : ''}>${hr}</option>`).join('');
        const mOptions = minutes.map(min => `<option value="${min}" ${m === min ? 'selected' : ''}>${min}</option>`).join('');
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Mulai <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="mulai-hour" class="form-control" style="flex: 1;" required>
                ${hOptions}
              </select>
              <span style="align-self: center; font-weight: bold;">.</span>
              <select id="mulai-minute" class="form-control" style="flex: 1;" required>
                ${mOptions}
              </select>
            </div>
          </div>
        `;
      }
    },
    {
      name: 'jam_selesai',
      label: 'Jam Selesai',
      type: 'custom',
      required: true,
      row: 2,
      render: (val) => {
        let h = '16';
        let m = '30';
        if (val && val.includes('.')) {
          const parts = val.split('.');
          h = parts[0].padStart(2, '0');
          m = parts[1].padStart(2, '0');
        }
        
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        
        const hOptions = hours.map(hr => `<option value="${hr}" ${h === hr ? 'selected' : ''}>${hr}</option>`).join('');
        const mOptions = minutes.map(min => `<option value="${min}" ${m === min ? 'selected' : ''}>${min}</option>`).join('');
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Selesai <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="selesai-hour" class="form-control" style="flex: 1;" required>
                ${hOptions}
              </select>
              <span style="align-self: center; font-weight: bold;">.</span>
              <select id="selesai-minute" class="form-control" style="flex: 1;" required>
                ${mOptions}
              </select>
            </div>
          </div>
        `;
      }
    }
  ],
  beforeSubmit: (formData) => {
    const mh = document.getElementById('mulai-hour')?.value || '14';
    const mm = document.getElementById('mulai-minute')?.value || '00';
    formData.jam_mulai = `${mh}.${mm}`;

    const sh = document.getElementById('selesai-hour')?.value || '16';
    const sm = document.getElementById('selesai-minute')?.value || '30';
    formData.jam_selesai = `${sh}.${sm}`;
  },
  calculateSummaryHTML: (s) => {
    return `
      <div class="summary-item"><div class="summary-value">${s.total || 0}</div><div class="summary-label">Total Data</div></div>
    `;
  }
});

export default page;
