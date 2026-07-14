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
  title: 'Tidak Adanya Kejadian Linen Hilang',
  subtitle: 'Tidak Adanya Kejadian Linen Yang Hilang',
  endpoint: '/laundry-linen-hilang',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Ruangan', key: 'ruangan' },
    { label: 'Jumlah Linen Diambil', key: 'jumlah_diambil' },
    { label: 'Jumlah Linen Dikembalikan', key: 'jumlah_dikembalikan' }
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
      name: 'jumlah_diambil',
      label: 'Jumlah Linen Diambil',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'jumlah_dikembalikan',
      label: 'Jumlah Linen Dikembalikan',
      type: 'number',
      required: true,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const numerator = s.numerator || 0;
    const denominator = s.denominator || 0;
    const persen = s.persen || 0;
    const standar = s.standar || '100%';
    
    return `
      <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
      <div class="summary-item"><div class="summary-value">${numerator}</div><div class="summary-label">Linen Dikembalikan (Numerator)</div></div>
      <div class="summary-item"><div class="summary-value">${denominator}</div><div class="summary-label">Linen Diambil (Denumerator)</div></div>
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
