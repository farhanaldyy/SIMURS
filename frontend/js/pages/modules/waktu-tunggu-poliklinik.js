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
  infoCardHTML: `
    <div class="card" style="margin-bottom: 20px; padding: 16px 20px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 1.4rem; color: #0284c7; line-height: 1; margin-top: 2px;">📌</div>
        <div style="font-size: 0.92rem; color: #1e293b; line-height: 1.6;">
          <strong style="color: #0369a1; font-weight: 700; font-size: 0.96rem;">Petunjuk Pengisian Data Rekapitulasi Bulanan:</strong><br>
          Data yang di-input pada menu ini merupakan <strong>total akumulasi data dalam 1 bulan penuh (periode terpilih)</strong>, <em>bukan data per hari</em>.<br>
          <span style="color: #475569;">Mohon masukkan rekapitulasi total <strong>Jumlah Pasien</strong> dan <strong>Rata-Rata Waktu Tunggu (Menit)</strong> untuk poliklinik yang bersangkutan selama satu bulan penuh.</span>
        </div>
      </div>
    </div>
  `,
  columns: [
    { label: 'Periode', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
    { label: 'Nama Poli', key: 'poli_id', render: (r) => r.poliklinik ? r.poliklinik.nama : '-' },
    { label: 'Total Pasien (1 Bulan)', key: 'jumlah_pasien' },
    { label: 'Rata-Rata Waktu Tunggu (Menit)', key: 'waktu_tunggu', render: (r) => `${r.waktu_tunggu} menit` }
  ],
  fields: [
    poliklinikField,
    { name: 'jumlah_pasien', label: 'Total Pasien (1 Bulan Penuh)', type: 'number', required: true, row: 2 },
    { name: 'waktu_tunggu', label: 'Rata-Rata Waktu Tunggu (Menit)', type: 'number', required: true, row: 2 }
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
        <div class="summary-label">Total Data Poli</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.totalPasien || 0}</div>
        <div class="summary-label">Total Pasien (1 Bulan)</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.totalWaktuTunggu || 0} m</div>
        <div class="summary-label">Total Akumulasi Menit</div>
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
