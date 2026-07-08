import { createGenericIndicatorPage } from './generic-indicator.js';
import Store from '../../store.js';

export default createGenericIndicatorPage({
  title: 'Laporan Waktu Tunggu Operasi Elektif',
  subtitle: 'Waktu tunggu pelaksanaan operasi elektif sejak penjadwalan hingga hari H operasi',
  endpoint: '/waktu-tunggu-operasi',
  columns: [
    { label: 'Periode', key: 'tanggal', render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
    { label: 'No RM', key: 'no_rm' },
    { label: 'Nama Pasien', key: 'nama_pasien' },
    { label: 'Diagnosa', key: 'diagnosa' },
    { label: 'Tgl Penjadwalan', key: 'tanggal_penjadwalan', render: (r) => new Date(r.tanggal_penjadwalan).toLocaleDateString('id-ID') },
    { label: 'Tgl Operasi', key: 'tanggal_operasi', render: (r) => new Date(r.tanggal_operasi).toLocaleDateString('id-ID') },
    { label: 'Waktu Tunggu', key: 'waktu_tunggu', render: (r) => `<strong>${r.waktu_tunggu} hari</strong>` }
  ],
  fields: [
    { name: 'no_rm', label: 'No RM', type: 'text', required: true, row: 1 },
    { name: 'nama_pasien', label: 'Nama Pasien', type: 'text', required: true, row: 1 },
    { name: 'diagnosa', label: 'Diagnosa', type: 'text', required: true, row: 2 },
    { name: 'tanggal_penjadwalan', label: 'Tanggal Penjadwalan', type: 'date', required: true, row: 3 },
    { name: 'tanggal_operasi', label: 'Tanggal Operasi', type: 'date', required: true, row: 3 }
  ],
  beforeSubmit(formData) {
    if (Store.periodeAktif) {
      const month = String(Store.periodeAktif.bulan).padStart(2, '0');
      const year = Store.periodeAktif.tahun;
      formData.tanggal = `${year}-${month}-01`;
    }
  },
  calculateSummaryHTML(s) {
    return `
      <div class="summary-item">
        <div class="summary-value">${s.total || 0}</div>
        <div class="summary-label">Total Pasien</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.totalWaktuTunggu || 0} hari</div>
        <div class="summary-label">Total Hari Waktu Tunggu</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${s.rataRata || 0} hari</div>
        <div class="summary-label">Rata-Rata Waktu Tunggu</div>
      </div>
    `;
  }
});
