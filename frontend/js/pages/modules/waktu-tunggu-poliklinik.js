import { createGenericIndicatorPage } from './generic-indicator.js';
import { api } from '../../api/client.js';
import Store from '../../store.js';

const poliklinikField = {
  name: 'poli_id',
  label: 'Poliklinik',
  type: 'select',
  required: true,
  row: 1,
  options: []
};

const page = createGenericIndicatorPage({
  title: 'Laporan Waktu Tunggu Poliklinik',
  subtitle: 'Waktu tunggu pelayanan pasien rawat jalan di poliklinik',
  endpoint: '/waktu-tunggu-poliklinik',
  columns: [
    { label: 'Periode', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
    { label: 'Nama Poli', key: 'poli_id', render: (r) => r.poliklinik ? r.poliklinik.nama : '-' },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Waktu Tunggu (Rata-rata Menit)', key: 'waktu_tunggu', render: (r) => `${r.waktu_tunggu} menit` }
  ],
  fields: [
    poliklinikField,
    { name: 'jumlah_pasien', label: 'Jumlah Pasien', type: 'number', required: true, row: 2 },
    { name: 'waktu_tunggu', label: 'Waktu Tunggu (Rata-rata Menit)', type: 'number', required: true, row: 2 }
  ],
  beforeSubmit(formData) {
    if (Store.periodeAktif) {
      const month = String(Store.periodeAktif.bulan).padStart(2, '0');
      const year = Store.periodeAktif.tahun;
      formData.tanggal = `${year}-${month}-01`;
    }
  },
  calculateSummaryHTML(s) {
    const rataRataVal = s.rataRata || 0;
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Data</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.totalPasien || 0}</div>
        <div class="summary-label">Total Pasien</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.totalWaktuTunggu || 0} m</div>
        <div class="summary-label">Total Waktu Tunggu</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${rataRataVal} m</div>
        <div class="summary-label">Rata-Rata Waktu Tunggu</div>
      </div>
      <div class="summary-item">
        <span class="badge ${rataRataVal <= 60 ? 'badge-success' : 'badge-danger'}">
          ${rataRataVal <= 60 ? '✓ Tercapai' : '✕ Tidak Tercapai'}
        </span>
        <div class="summary-label" style="margin-top:8px">Standar: ≤ 60 menit</div>
      </div>
    `;
  }
});

const originalRender = page.render;
page.render = async function(container) {
  try {
    const res = await api.get('/master-poliklinik?aktif=true&all=true');
    if (res.success) {
      poliklinikField.options = res.data.map(p => ({ value: p.id, label: p.nama }));
    }
  } catch (err) {
    console.error('Failed to load master poliklinik options:', err);
  }
  await originalRender(container);
};

export default page;
