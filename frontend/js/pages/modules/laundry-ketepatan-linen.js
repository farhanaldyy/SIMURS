import { createGenericIndicatorPage } from './generic-indicator.js';
import { api } from '../../api/client.js';
import { renderBadge } from '../../components/indicator-badge.js';

let rooms = [];

async function loadRooms() {
  if (rooms.length > 0) return;
  const res = await api.get('/units');
  if (res.success) {
    const excludedKeywords = [
      'farmasi', 'gizi', 'pendaftaran', 'rekam medis', 'simrs', 
      'ipsrs', 'keperawatan', 'laundry', 'poliklinik', 'poli klinik', 'rawat jalan'
    ];
    rooms = res.data.filter(u => {
      const name = u.nama_unit.toLowerCase();
      return !excludedKeywords.some(keyword => name.includes(keyword));
    }).map(u => u.nama_unit);
  }
}

const page = createGenericIndicatorPage({
  title: 'Ketepatan Waktu Penyediaan Linen Bersih',
  subtitle: 'Ketepatan Waktu Penyediaan Linen Bersih Untuk Ruang Rawat Inap',
  endpoint: '/laundry-ketepatan-linen',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    {
      label: 'Jam Jadwal',
      render: (r) => {
        const d = new Date(r.jam_jadwal);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      }
    },
    { label: 'Ruangan', key: 'ruangan' },
    {
      label: 'Jam Ganti',
      render: (r) => {
        const d = new Date(r.jam_ganti);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      }
    },
    {
      label: 'Tepat Waktu',
      render: (r) => r.tepat_waktu ? '<span style="color: #28a745; font-weight: bold; font-size: 1.2rem;">✓</span>' : '-'
    },
    {
      label: 'Tidak Tepat Waktu',
      render: (r) => !r.tepat_waktu ? '<span style="color: #dc3545; font-weight: bold; font-size: 1.2rem;">✓</span>' : '-'
    }
  ],
  fields: [
    {
      name: 'tanggal',
      label: 'Tanggal',
      type: 'date',
      required: true,
      row: 1
    },
    {
      name: 'ruangan',
      label: 'Ruangan',
      type: 'custom',
      required: true,
      row: 1,
      render: (val, data) => {
        const options = rooms.map(r => `<option value="${r}" ${val === r ? 'selected' : ''}>${r}</option>`).join('');
        return `
          <div class="form-group">
            <label class="form-label">Ruangan <span class="required">*</span></label>
            <select name="ruangan" class="form-control" required>
              <option value="" disabled ${!val ? 'selected' : ''}>-- Pilih Ruangan --</option>
              ${options}
            </select>
          </div>
        `;
      }
    },
    {
      name: 'jam_jadwal',
      label: 'Jam Jadwal',
      type: 'custom',
      required: true,
      row: 2,
      render: (val, data) => {
        let h = '08';
        let m = '00';
        if (val) {
          const d = new Date(val);
          h = String(d.getUTCHours()).padStart(2, '0');
          m = String(d.getUTCMinutes()).padStart(2, '0');
        }
        
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        
        const hOptions = hours.map(hr => `<option value="${hr}" ${h === hr ? 'selected' : ''}>${hr}</option>`).join('');
        const mOptions = minutes.map(min => `<option value="${min}" ${m === min ? 'selected' : ''}>${min}</option>`).join('');
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Jadwal <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="jadwal-hour" class="form-control" style="flex: 1;" required>
                ${hOptions}
              </select>
              <span style="align-self: center; font-weight: bold;">:</span>
              <select id="jadwal-minute" class="form-control" style="flex: 1;" required>
                ${mOptions}
              </select>
            </div>
          </div>
        `;
      }
    },
    {
      name: 'jam_ganti',
      label: 'Jam Ganti',
      type: 'custom',
      required: true,
      row: 2,
      render: (val, data) => {
        let h = '08';
        let m = '00';
        if (val) {
          const d = new Date(val);
          h = String(d.getUTCHours()).padStart(2, '0');
          m = String(d.getUTCMinutes()).padStart(2, '0');
        }
        
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        
        const hOptions = hours.map(hr => `<option value="${hr}" ${h === hr ? 'selected' : ''}>${hr}</option>`).join('');
        const mOptions = minutes.map(min => `<option value="${min}" ${m === min ? 'selected' : ''}>${min}</option>`).join('');
        
        return `
          <div class="form-group">
            <label class="form-label">Jam Ganti <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <select id="ganti-hour" class="form-control" style="flex: 1;" required>
                ${hOptions}
              </select>
              <span style="align-self: center; font-weight: bold;">:</span>
              <select id="ganti-minute" class="form-control" style="flex: 1;" required>
                ${mOptions}
              </select>
            </div>
          </div>
        `;
      }
    }
  ],
  beforeSubmit: (formData) => {
    const jh = document.getElementById('jadwal-hour')?.value || '08';
    const jm = document.getElementById('jadwal-minute')?.value || '00';
    formData.jam_jadwal = `${jh}:${jm}`;

    const gh = document.getElementById('ganti-hour')?.value || '08';
    const gm = document.getElementById('ganti-minute')?.value || '00';
    formData.jam_ganti = `${gh}:${gm}`;
  },
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const numerator = s.numerator || 0;
    const tidakTepat = s.tidak_tepat || 0;
    const denominator = s.denominator || 0;
    const persen = s.persen || 0;
    const standar = s.standar || '100%';
    
    return `
      <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
      <div class="summary-item"><div class="summary-value">${numerator}</div><div class="summary-label">Tepat Waktu (Numerator)</div></div>
      <div class="summary-item"><div class="summary-value">${tidakTepat}</div><div class="summary-label">Tidak Tepat Waktu</div></div>
      <div class="summary-item"><div class="summary-value">${denominator}</div><div class="summary-label">Denumerator</div></div>
      <div class="summary-item"><div class="summary-value">${persen}%</div><div class="summary-label">Persentase</div></div>
      <div class="summary-item">
        ${renderBadge(persen, standar)}
        <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
      </div>
    `;
  }
});

const originalRender = page.render;
page.render = async function(container) {
  await loadRooms();
  await originalRender(container);
};

export default page;
