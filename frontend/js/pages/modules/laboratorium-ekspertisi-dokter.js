import { createGenericIndicatorPage } from './generic-indicator.js';
import { renderBadge } from '../../components/indicator-badge.js';
import Store from '../../store.js';

const page = createGenericIndicatorPage({
  title: 'Data Ekspertisi Oleh Dokter',
  subtitle: 'Data Ekspertisi Oleh Dokter Laboratorium',
  endpoint: '/laboratorium-ekspertisi-dokter',
  columns: [
    { 
      label: 'Tanggal', 
      render: (r) => new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    { label: 'Jumlah Pasien', key: 'jumlah_pasien' },
    { label: 'Ekspertisi Dokter', key: 'ekspertisi_dokter' },
    { label: 'Keterangan', key: 'keterangan' },
    { 
      label: 'Persentase Ekspertisi', 
      render: (r) => `${r.presentase || 0}%`
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
      name: 'jumlah_pasien',
      label: 'Jumlah Pasien',
      type: 'number',
      required: true,
      row: 1
    },
    {
      name: 'ekspertisi_dokter',
      label: 'Ekspertisi Dokter',
      type: 'number',
      required: true,
      row: 2
    },
    {
      name: 'keterangan',
      label: 'Keterangan (Opsional)',
      type: 'textarea',
      required: false,
      row: 2
    }
  ],
  calculateSummaryHTML: (s) => {
    const total = s.total || 0;
    const totalPasien = s.total_pasien || 0;
    const totalEkspertisi = s.total_ekspertisi || 0;
    const presentase = s.presentase || 0;
    const standar = s.standar || '100%';
    
    const isCompliant = presentase >= 100;
    const mutuText = isCompliant ? 'sudah terpenuhi' : 'masih rendah';

    const bulanNama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const bulan = Store.periodeAktif ? bulanNama[Store.periodeAktif.bulan] : '-';
    const tahun = Store.periodeAktif ? Store.periodeAktif.tahun : '-';
    const periodeStr = `${bulan} ${tahun}`;
      
    return `
      <div class="summary-card-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%;">
        <div class="summary-item"><div class="summary-value">${total}</div><div class="summary-label">Total Data</div></div>
        <div class="summary-item"><div class="summary-value">${totalPasien}</div><div class="summary-label">Total Pasien</div></div>
        <div class="summary-item"><div class="summary-value">${totalEkspertisi}</div><div class="summary-label">Total Ekspertisi</div></div>
        <div class="summary-item"><div class="summary-value">${presentase}%</div><div class="summary-label">Persentase Ekspertisi</div></div>
        <div class="summary-item">
          ${renderBadge(presentase, standar)}
          <div class="summary-label" style="margin-top:8px">Standar: ${standar}</div>
        </div>
      </div>
      <div class="summary-note" style="margin-top: 20px; padding: 16px; background-color: var(--bg-secondary, #f8f9fa); border-left: 4px solid var(--primary-color, #007bff); border-radius: 4px; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary, #333);">
        <strong>Catatan:</strong><br>
        Berdasarkan data maka dapat disimpulkan bahwa hasil pemeriksaan laboratorium yang ekspertisinya dilakukan oleh dokter spesialis patologi klinik adalah <strong>${totalEkspertisi}</strong> pasien dari <strong>${totalPasien}</strong> pasien yang dilakukan pemeriksaan pada bulan <strong>${periodeStr}</strong>.<br>
        <strong>Kesimpulan:</strong><br>
        Artinya mutu ekspertisi yang dilakukan oleh dokter spesialis patologi klinik <strong>${mutuText}</strong> yaitu <strong>${presentase}%</strong> dari standar menkes 100%.
      </div>
    `;
  }
});

export default page;
