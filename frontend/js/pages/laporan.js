import Store from '../store.js';
import { api } from '../api/client.js';
import { showToast } from '../components/toast.js';

let state = { summaries: {}, cacheKey: null };

function getSelectedFilters() {
  const filterPeriode = document.getElementById('filter-periode');
  const filterUnit = document.getElementById('filter-unit');

  const pid = (filterPeriode && filterPeriode.value)
    ? parseInt(filterPeriode.value, 10)
    : Store.periodeAktif?.id || null;

  let uid = null;
  if (filterUnit && filterUnit.options && filterUnit.options.length > 0) {
    uid = filterUnit.value ? parseInt(filterUnit.value, 10) : null;
  } else {
    uid = Store.unitAktif?.id || null;
  }

  return { pid, uid };
}

async function updatePrintHeader(activePeriode, activeUnit) {
  if (!Store.hospitalInfo) {
    await Store.loadHospitalInfo();
  }
  const info = Store.hospitalInfo || {};
  const namaRs = (info.nama_rs || 'RUMAH SAKIT ISLAM KARAWANG').toUpperCase();
  const alamat = info.alamat || '';
  const kota = info.kota || 'Karawang';
  const logoUrl = info.logo_url || 'assets/img/logo.png';
  const direkturNama = info.nama_direktur || 'dr. H. Mastemer, Sp.B';
  const direkturNip = info.nip_direktur ? `NIP. ${info.nip_direktur}` : '';

  const kontakArr = [];
  if (info.telepon) kontakArr.push(`Telp: ${info.telepon}`);
  if (info.email) kontakArr.push(`Email: ${info.email}`);
  if (info.website) kontakArr.push(`Website: ${info.website}`);
  if (info.kode_rs) kontakArr.push(`Kode Fasyankes: ${info.kode_rs}`);
  const kontakStr = kontakArr.join('  •  ');

  const bulanNama = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const pBulan = activePeriode ? bulanNama[activePeriode.bulan - 1] : '';
  const pTahun = activePeriode ? activePeriode.tahun : '';
  const unitText = activeUnit ? `| Unit: ${activeUnit.nama_unit}` : '| Unit: Semua Unit';

  const logoEl = document.getElementById('print-kop-logo');
  if (logoEl) logoEl.src = logoUrl;

  const namaEl = document.getElementById('print-kop-nama');
  if (namaEl) namaEl.textContent = namaRs;

  const alamatEl = document.getElementById('print-kop-alamat');
  if (alamatEl) alamatEl.textContent = alamat ? `${alamat}${kota ? ', ' + kota : ''}` : (kota || '-');

  const kontakEl = document.getElementById('print-kop-kontak');
  if (kontakEl) kontakEl.textContent = kontakStr || '-';

  const subtitleEl = document.getElementById('print-subtitle');
  if (subtitleEl) subtitleEl.textContent = `Periode: ${pBulan} ${pTahun}   ${unitText}`;

  const dateEl = document.getElementById('print-date');
  if (dateEl) {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    dateEl.textContent = `${kota}, ${todayStr}`;
  }

  const dirNamaEl = document.getElementById('print-direktur-nama');
  if (dirNamaEl) dirNamaEl.textContent = direkturNama;

  const dirNipEl = document.getElementById('print-direktur-nip');
  if (dirNipEl) dirNipEl.textContent = direkturNip;
}

async function loadData(forceRefresh = false) {
  const { pid, uid } = getSelectedFilters();

  const activePeriode = (Store.periodeList && pid)
    ? Store.periodeList.find(p => p.id == pid) || Store.periodeAktif
    : Store.periodeAktif;
  const activeUnit = (Store.unitList && uid)
    ? Store.unitList.find(u => u.id == uid) || Store.unitAktif
    : (uid ? Store.unitAktif : null);

  await updatePrintHeader(activePeriode, activeUnit);

  if (!pid) {
    const previewBody = document.getElementById('report-summary-table-body');
    if (previewBody) {
      previewBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-muted); padding: 24px;">Pilih periode terlebih dahulu.</td></tr>';
    }
    return;
  }

  const cacheKey = `${pid}_${uid || 'all'}`;
  if (!forceRefresh && state.cacheKey === cacheKey && Object.keys(state.summaries).length > 0) {
    renderReportTable();
    return;
  }

  let url = `/laporan/summary?periode_id=${pid}`;
  if (uid) url += `&unit_id=${uid}`;

  const res = await api.get(url);
  if (res.success) {
    state.summaries = res.data;
    state.cacheKey = cacheKey;
    renderReportTable();
  }
}

const serviceToHash = {
  'Risiko Jatuh': '#/risiko-jatuh',
  'Insiden Keselamatan': '#/insiden-keselamatan',
  'Identifikasi Pasien': '#/identifikasi-pasien',
  'Reaksi Transfusi': '#/reaksi-transfusi',
  'Gelang Identitas': '#/gelang-identitas',
  'Serah Terima Pasien': '#/serah-terima-pasien',
  'Kepatuhan Kebersihan Tangan': '#/kepatuhan-kebersihan-tangan',
  'Kepatuhan Penggunaan APD': '#/kepatuhan-apd',
  'Angka Kematian Ranap': '#/angka-kematian-ranap',
  'Double Check High Alert': '#/double-check-high-alert',
  'Visit Dokter Spesialis': '#/visit-dokter',
  'Kembali ICU < 72 Jam': '#/kembali-icu',
  'Alur Klinis': '#/alur-klinis',
  'Waktu Tanggap SC': '#/waktu-tanggap-sc',
  'Emergency Response Time': '#/emergency-response-time',
  'Angka Kematian IGD': '#/angka-kematian-igd',
  'Asesmen Awal IGD': '#/asesmen-awal-igd',
  'Pasien Tertahan IGD': '#/pasien-tertahan-igd',
  'Ketidakpatuhan Pasien HD': '#/ketidakpatuhan-hd',
  'Insiden Clotting Durante HD': '#/insiden-clotting',
  'Insiden Pasien Jatuh HD': '#/insiden-pasien-jatuh-hd',
  'Insiden Jarum Vena HD': '#/insiden-jarum-vena',
  'Penundaan Operasi Elektif': '#/penundaan-operasi',
  'Informed Consent Bedah': '#/informed-consent-pembedahan',
  'Informed Consent Anestesi': '#/informed-consent-anestesi',
  'Asesmen Pra Bedah': '#/asesmen-pra-bedah',
  'Asesmen Pra Anestesi': '#/asesmen-pra-anestesi',
  'Surgical Safety Checklist SC': '#/surgical-checklist-sc',
  'Surgical Safety Checklist Op': '#/surgical-checklist-operasi',
  'Penandaan Lokasi Operasi': '#/penandaan-lokasi-operasi',
  'Kejadian Kematian di Meja Operasi': '#/mutu-kamar-operasi',
  'Kejadian Operasi Salah Sisi': '#/mutu-kamar-operasi',
  'Kejadian Operasi Salah Orang': '#/mutu-kamar-operasi',
  'Kejadian Operasi Salah Prosedur / Tindakan': '#/mutu-kamar-operasi',
  'Kelengkapan Laporan Anestesi Sedasi': '#/mutu-kamar-operasi',

  // Gizi
  'Ketepatan Waktu Makanan': '#/gizi-waktu-makanan',
  'Sisa Makanan Pasien': '#/gizi-sisa-makanan',
  'Akurasi Pemberian Diet': '#/gizi-kesalahan-diet',
  'Identifikasi Pasien SIMRS': '#/gizi-identifikasi-pasien',

  // Rawat Jalan
  'Waktu Tunggu Poliklinik': '#/waktu-tunggu-poliklinik',
  'Waktu Tunggu Operasi Elektif': '#/waktu-tunggu-operasi-elektif',

  // Rehabilitasi Medis
  'Kejadian drop out pasien terhadap pelayanan rehabilitasi medik yang direncanakan': '#/rehab-drop-out',
  'Tidak adanya kejadian kesalahan tindakan rehabilitasi medik': '#/rehab-kesalahan-tindakan',
  'Waktu tunggu pelayanan rawat jalan rehabilitasi medik': '#/rehab-waktu-tunggu',
  'Kepatuhan identitas pasien': '#/rehab-kepatuhan-identitas',
  'Kepuasan pasien dengan pelayanan rehabilitasi medik': '#/rehab-kepuasan-pasien',

  // Laundry
  'Ketepatan Waktu Penyediaan Linen Bersih': '#/laundry-ketepatan-linen',
  'Tidak Adanya Kejadian Linen Hilang': '#/laundry-linen-hilang',

  // Radiologi
  'Jadwal Dokter Radiologi': '#/radiologi-jadwal-dokter',
  'Waktu tunggu hasil pelayanan foto thorax (Sesuai jadwal)': '#/radiologi-thorax-sesuai-jadwal',
  'Waktu tunggu hasil pelayanan foto thorax (Diluar jadwal)': '#/radiologi-thorax-luar-jadwal',
  'Kejadian Foto Ulang Pasien': '#/radiologi-foto-ulang',
  'Kelengkapan pengisian form pemberian info tindakan radiologi': '#/radiologi-info-tindakan',
  'Kepatuhan Identifikasi Pasien (Radiologi)': '#/radiologi-identifikasi-pasien',

  // Laboratorium
  'Jadwal Dokter Laboratorium': '#/laboratorium-jadwal-dokter',
  'Waktu tunggu hasil pemeriksaan laboratorium (< 140 Menit)': '#/laboratorium-waktu-tunggu-lt-140',
  'Waktu tunggu hasil pemeriksaan laboratorium (> 140 Menit)': '#/laboratorium-waktu-tunggu-gt-140',
  'Pelaporan hasil kritis laboratorium  ≤ 30 menit': '#/laboratorium-hasil-kritis',
  'Tidak adanya kesalahan hasil input pemeriksaan lab': '#/laboratorium-kesalahan-input',
  'Tidak adanya kerusakan sampel di laboratorium': '#/laboratorium-kerusakan-sampel',
  'Kepatuhan Identifikasi Pasien Laboratorium': '#/laboratorium-kepatuhan-identifikasi',
  'Data Ekspertisi Oleh Dokter Laboratorium': '#/laboratorium-ekspertisi-dokter',
  'Tidak Adanya Kesalahan Penyerahan Hasil Lab': '#/laboratorium-kesalahan-penyerahan',

  // Farmasi
  'Kepatuhan Pelaksanaan Double Check Obat High Alert': '#/mutu-farmasi',
  'Ketidaktersediaan Obat di Farmasi di Rawat Jalan': '#/mutu-farmasi',
  'Ketidaktersediaan Obat di Farmasi di Rawat Inap': '#/mutu-farmasi',
  'Waktu Tunggu Obat Racikan dan Non Racikan': '#/mutu-farmasi',
  'Rata Rata Menut waktu tunggu': '#/mutu-farmasi',
  'Kesalahan Penyerahan Obat Kepada Pasien': '#/kesalahan-penyerahan-obat',
  'Kepatuhan penggunaan formularium nasional': '#/kepatuhan-formularium-nasional',

  // SIMRS
  'Response Time SIMRS IT': '#/simrs-response-time-it',

  // Rekam Medis
  'Kelengkapan Dokumen Rekam Medis Pasien Ranap': '#/mutu-rekam-medis',
  'Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam': '#/mutu-rekam-medis',
  'Pemberian Informasi Antrian Online': '#/mutu-rekam-medis',
  'Ketepatan Coding Rawat Inap & Rawat Jalan': '#/mutu-rekam-medis',
  'Antrian Mobile JKN': '#/mutu-rekam-medis',

  // Pelayanan
  'Kepuasan Pasien Pada Pelayanan': '#/kepuasan-pasien-pelayanan',
  'Kecepatan Waktu Tanggap Komplain': '#/waktu-tanggap-komplain'
};

function renderReportTable() {
  const container = document.getElementById('report-summary-table-body');
  if (!container) return;

  const user = Store.get('user');
  const role = user ? user.role : '';

  let entries = Object.entries(state.summaries);
  if (role === 'petugas') {
    entries = entries.filter(([name]) => {
      const hash = serviceToHash[name];
      return hash && Store.hasAllowedModule(hash, user);
    });
  }

  if (entries.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-muted); padding: 24px;">Tidak ada data untuk periode dan unit terpilih.</td></tr>';
    return;
  }

  const rows = entries.map(([name, s], idx) => {
    let achieved = false;
    let hasil = `${s.persen || 0}%`;

    if (name === 'Insiden Keselamatan') {
      hasil = `${s.total} Kasus`;
      achieved = s.total === 0;
    } else if (s.rataRata !== undefined) {
      hasil = `${s.rataRata}`;
      if (name === 'Rata Rata Menut waktu tunggu') {
        const match = s.rataRata.match(/\d+/g);
        if (match && match.length >= 2) {
          const racikanVal = parseFloat(match[0]);
          const nonRacikanVal = parseFloat(match[1]);
          achieved = racikanVal < 60 && nonRacikanVal < 30;
        } else {
          achieved = false;
        }
      } else {
        const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
        const rVal = parseFloat(s.rataRata);
        if (s.standar.includes('≤')) {
          achieved = rVal <= targetVal;
        } else {
          achieved = rVal >= targetVal;
        }
      }
    } else if ((name.includes('Kematian') && name !== 'Kejadian Kematian di Meja Operasi') || name.includes('Kembali ICU') || name.includes('Clotting') || name.includes('Ketidakpatuhan')) {
      hasil = `${s.total} Kasus`;
      achieved = s.total === 0;
    } else {
      const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
      const currentVal = parseFloat(s.persen || 0);
      if (s.standar.includes('<')) {
        achieved = currentVal < targetVal;
      } else if (s.standar.includes('≤')) {
        achieved = currentVal <= targetVal;
      } else if (s.standar.includes('≥')) {
        achieved = currentVal >= targetVal;
      } else if (s.standar.includes('>')) {
        achieved = currentVal > targetVal;
      } else if (targetVal === 0 || s.standar === '0%' || s.standar === '0') {
        achieved = currentVal <= targetVal;
      } else {
        achieved = currentVal >= targetVal;
      }
    }

    const badge = achieved 
      ? '<span class="badge badge-success">Tercapai</span>' 
      : '<span class="badge badge-danger">Belum Tercapai</span>';

    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${s.category}</strong></td>
        <td>${name}</td>
        <td style="text-align: center;">${s.standar}</td>
        <td style="font-weight: bold; text-align: center;">${hasil}</td>
        <td style="text-align: center;">${badge}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = rows;
}

async function downloadExcelFile() {
  const { pid, uid } = getSelectedFilters();
  if (!pid) {
    showToast('Pilih periode terlebih dahulu', 'error');
    return;
  }
  
  let url = `/api/laporan/export/excel?periode_id=${pid}`;
  if (uid) url += `&unit_id=${uid}`;

  showToast('Menyiapkan file Excel...', 'info');

  try {
    const token = Store.get('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Gagal mengunduh file');

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    
    const activePeriode = (Store.periodeList && pid)
      ? Store.periodeList.find(p => p.id == pid) || Store.periodeAktif
      : Store.periodeAktif;
    let filename = `Laporan_Mutu_${activePeriode ? activePeriode.bulan : ''}_${activePeriode ? activePeriode.tahun : ''}.xlsx`;
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Excel berhasil diunduh', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal mengekspor data Excel', 'error');
  }
}

async function downloadTemplateFile() {
  showToast('Menyiapkan template Excel...', 'info');
  try {
    const token = Store.get('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/laporan/template-excel', { headers });
    if (!res.ok) throw new Error('Gagal mengunduh template');

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'Template_Import_SIMURS.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Template Excel berhasil diunduh', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal mengekspor template Excel', 'error');
  }
}

async function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  showToast('Memvalidasi & mengimpor data Excel...', 'info');

  try {
    const token = Store.get('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/laporan/import-excel', {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Data Excel berhasil diimpor!', 'success');
      if (data.errors && data.errors.length > 0) {
        setTimeout(() => {
          showToast(`Catatan Import: ${data.errors[0]}`, 'warning');
        }, 1500);
      }
      loadData(true);
    } else {
      showToast(data.message || 'Gagal mengimpor data', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Gagal mengunggah file Excel', 'error');
  }
}

async function populateFilters() {
  const { getPeriode, getUnits } = await import('../api/master.js');
  
  if (!Store.periodeList || Store.periodeList.length === 0) {
    const res = await getPeriode();
    if (res.success) Store.periodeList = res.data;
  }
  if (!Store.unitList || Store.unitList.length === 0) {
    const res = await getUnits();
    if (res.success) Store.unitList = res.data;
  }

  const user = Store.get('user');
  if (user && user.unit_id && (user.role === 'petugas' || !Store.unitAktif) && Store.unitList) {
    const userUnit = Store.unitList.find(u => u.id === user.unit_id);
    if (userUnit && (!Store.unitAktif || Store.unitAktif.id !== userUnit.id)) {
      Store.set('unitAktif', userUnit);
    }
  }

  const filterPeriode = document.getElementById('filter-periode');
  const filterUnit = document.getElementById('filter-unit');

  if (filterPeriode && Store.periodeList) {
    const bulanNama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    filterPeriode.innerHTML = '<option value="">Pilih Periode</option>' +
      Store.periodeList.map(p => {
        const selected = Store.periodeAktif && Store.periodeAktif.id === p.id ? 'selected' : '';
        return `<option value="${p.id}" ${selected}>${bulanNama[p.bulan]} ${p.tahun} ${p.status === 'closed' ? '🔒' : ''}</option>`;
      }).join('');
  }

  if (filterUnit && Store.unitList) {
    if (user && user.role === 'petugas' && user.unit_id) {
      filterUnit.innerHTML = Store.unitList
        .filter(u => u.id === user.unit_id)
        .map(u => `<option value="${u.id}" selected>${u.nama_unit}</option>`)
        .join('');
      filterUnit.disabled = true;
    } else {
      filterUnit.disabled = false;
      filterUnit.innerHTML = '<option value="">Semua Unit</option>' +
        Store.unitList.map(u => {
          const selected = Store.unitAktif && Store.unitAktif.id === u.id ? 'selected' : '';
          return `<option value="${u.id}" ${selected}>${u.nama_unit}</option>`;
        }).join('');
    }
  }
}

function handleGlobalFilterChange() {
  const filterPeriode = document.getElementById('filter-periode');
  const filterUnit = document.getElementById('filter-unit');
  if (filterPeriode) filterPeriode.value = Store.periodeAktif?.id || '';
  if (filterUnit) filterUnit.value = Store.unitAktif?.id || '';
  loadData();
}

export const render = async (container) => {
  container.innerHTML = `
    <style>
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 12mm 12mm;
        }
        body {
          background: #ffffff !important;
          color: #000000 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
          width: 100% !important;
        }
        .print-kop-wrapper {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 16px !important;
          padding-bottom: 6px !important;
        }
        .print-kop-logo-box {
          width: 65px !important;
          height: 65px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .print-kop-logo-box img {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
        }
        .print-kop-text {
          text-align: center !important;
          flex: 1 !important;
        }
        .print-kop-text h1 {
          margin: 0 !important;
          font-size: 1.3rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          line-height: 1.2 !important;
        }
        .print-kop-text p.print-kop-sub {
          margin: 2px 0 0 0 !important;
          font-size: 0.8rem !important;
          color: #334155 !important;
          line-height: 1.3 !important;
        }
        .print-kop-text p.print-kop-contacts {
          margin: 1px 0 0 0 !important;
          font-size: 0.75rem !important;
          color: #64748b !important;
          font-style: normal !important;
        }
        .print-kop-divider {
          border-bottom: 2.5px solid #0f172a !important;
          border-top: 1px solid #0f172a !important;
          height: 3px !important;
          margin: 6px 0 14px 0 !important;
        }
        .print-title-section {
          text-align: center !important;
          margin-bottom: 14px !important;
        }
        .print-title {
          margin: 0 !important;
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          color: #0f172a !important;
        }
        .print-subtitle {
          margin-top: 4px !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }
        .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 8px !important;
          font-size: 8pt !important;
        }
        .print-table thead {
          display: table-header-group !important;
        }
        .print-table tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-table th {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          font-weight: 700 !important;
          border: 1px solid #475569 !important;
          padding: 6px 6px !important;
          text-transform: uppercase !important;
          font-size: 7.5pt !important;
          letter-spacing: 0.2px !important;
          vertical-align: middle !important;
        }
        .print-table td {
          border: 1px solid #94a3b8 !important;
          padding: 5px 6px !important;
          color: #0f172a !important;
          vertical-align: middle !important;
          font-size: 8pt !important;
          line-height: 1.25 !important;
        }
        .print-table tbody tr:nth-child(even) td {
          background-color: #f8fafc !important;
        }
        .print-table .badge {
          display: inline-block !important;
          padding: 2px 8px !important;
          border-radius: 9999px !important;
          font-size: 7.5pt !important;
          font-weight: 700 !important;
          text-align: center !important;
          line-height: 1.2 !important;
        }
        .print-table .badge-success {
          background-color: #ecfdf5 !important;
          border: 1px solid #10b981 !important;
          color: #047857 !important;
        }
        .print-table .badge-danger {
          background-color: #fef2f2 !important;
          border: 1px solid #ef4444 !important;
          color: #b91c1c !important;
        }
        .print-signature-wrapper {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin-top: 32px !important;
          padding: 0 24px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-signature-col {
          text-align: center !important;
          min-width: 220px !important;
          font-size: 8.5pt !important;
        }
        .print-sig-lead {
          color: #475569 !important;
          font-size: 8pt !important;
        }
        .print-sig-role {
          font-weight: 700 !important;
          margin-top: 2px !important;
          color: #0f172a !important;
        }
        .print-sig-space {
          height: 54px !important;
        }
        .print-sig-name {
          font-weight: 700 !important;
          color: #0f172a !important;
          text-decoration: underline !important;
          font-size: 9pt !important;
        }
        .print-sig-nip {
          margin-top: 2px !important;
          font-size: 7.5pt !important;
          color: #64748b !important;
        }
      }
    </style>

    <div class="module-page no-print">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cetak & Ekspor Laporan</h1>
          <p class="page-subtitle">Unduh rekapitulasi data mutu bulanan format Excel/PDF</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Filter Laporan</h3>
        <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 200px;">
            <label class="form-label">Periode</label>
            <select class="form-control" id="filter-periode">
              <option value="">Pilih Periode</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 200px;">
            <label class="form-label">Unit</label>
            <select class="form-control" id="filter-unit">
              <option value="">Semua Unit</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Opsi Ekspor Laporan</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-export-excel">📁 Unduh Excel (.xlsx)</button>
          <button class="btn btn-outline" id="btn-print-pdf">🖨️ Cetak PDF / Print</button>
        </div>
      </div>

      <div class="card" style="padding: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Pratinjau Kepatuhan Indikator</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 60px; text-align: center;">No</th>
                <th style="text-align: left;">Kategori</th>
                <th style="text-align: left;">Nama Indikator</th>
                <th style="text-align: center; width: 140px;">Target Standar</th>
                <th style="text-align: center; width: 150px;">Hasil Pencapaian</th>
                <th style="text-align: center; width: 140px;">Status</th>
              </tr>
            </thead>
            <tbody id="report-summary-table-body">
              <tr><td colspan="6" style="text-align: center; color: var(--color-muted); padding: 24px;">Memuat ringkasan data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Print-only layout container -->
    <div class="print-only">
      <!-- Kop Surat Dinamis Berdasarkan Data Setting & Integrasi -->
      <div class="print-kop-wrapper">
        <div class="print-kop-logo-box">
          <img id="print-kop-logo" src="assets/img/logo.png" alt="Logo RS">
        </div>
        <div class="print-kop-text">
          <h1 id="print-kop-nama">RUMAH SAKIT ISLAM KARAWANG</h1>
          <p id="print-kop-alamat" class="print-kop-sub">Jl. Pangkal Perjuangan No. 1, Karawang, Jawa Barat</p>
          <p id="print-kop-kontak" class="print-kop-contacts">Telp: - • Email: -</p>
        </div>
      </div>
      <div class="print-kop-divider"></div>

      <!-- Title & Subtitle Laporan -->
      <div class="print-title-section">
        <h2 class="print-title">LAPORAN CAPAIAN INDIKATOR MUTU</h2>
        <div id="print-subtitle" class="print-subtitle">
          Periode: - | Unit: -
        </div>
      </div>

      <!-- Tabel Capaian Mutu -->
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 38px; text-align: center;">No</th>
            <th style="width: 140px; text-align: left;">Kategori</th>
            <th style="text-align: left;">Nama Indikator</th>
            <th style="width: 95px; text-align: center;">Target</th>
            <th style="width: 105px; text-align: center;">Pencapaian</th>
            <th style="width: 105px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody id="print-table-body">
          <!-- Populated dynamically -->
        </tbody>
      </table>

      <!-- Lembar Tanda Tangan -->
      <div class="print-signature-wrapper">
        <div class="print-signature-col">
          <div class="print-sig-lead">Mengetahui,</div>
          <div class="print-sig-role">Direktur Rumah Sakit</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name" id="print-direktur-nama">dr. H. Mastemer, Sp.B</div>
          <div class="print-sig-nip" id="print-direktur-nip"></div>
        </div>
        <div class="print-signature-col">
          <div class="print-sig-lead" id="print-date">Karawang, -</div>
          <div class="print-sig-role">Komite Mutu & Keselamatan Pasien</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">( ___________________________ )</div>
          <div class="print-sig-nip">Ketua Komite Mutu</div>
        </div>
      </div>
    </div>
  `;

  // Bind export/import events
  document.getElementById('btn-export-excel').addEventListener('click', downloadExcelFile);
  document.getElementById('btn-print-pdf').addEventListener('click', async () => {
    const { pid, uid } = getSelectedFilters();
    const activePeriode = (Store.periodeList && pid)
      ? Store.periodeList.find(p => p.id == pid) || Store.periodeAktif
      : Store.periodeAktif;
    const activeUnit = (Store.unitList && uid)
      ? Store.unitList.find(u => u.id == uid) || Store.unitAktif
      : (uid ? Store.unitAktif : null);

    await updatePrintHeader(activePeriode, activeUnit);

    const previewBody = document.getElementById('report-summary-table-body');
    const printBody = document.getElementById('print-table-body');
    if (previewBody && printBody) {
      printBody.innerHTML = previewBody.innerHTML;
    }
    window.print();
  });

  const btnTemplate = document.getElementById('btn-download-template');
  if (btnTemplate) {
    btnTemplate.addEventListener('click', downloadTemplateFile);
  }

  const importInput = document.getElementById('input-import-excel');
  if (importInput) {
    importInput.addEventListener('change', handleImport);
  }

  // Populate filter selects
  await populateFilters();

  const filterPeriode = document.getElementById('filter-periode');
  const filterUnit = document.getElementById('filter-unit');

  filterPeriode.addEventListener('change', (e) => {
    const pId = e.target.value;
    const period = Store.periodeList.find(p => p.id == pId);
    Store.set('periodeAktif', period || null);
    
    const headerSelect = document.getElementById('header-periode-select');
    if (headerSelect) headerSelect.value = pId;

    window.dispatchEvent(new CustomEvent('periodeChanged'));
  });

  filterUnit.addEventListener('change', (e) => {
    const uId = e.target.value;
    const unit = Store.unitList.find(u => u.id == uId);
    Store.set('unitAktif', unit || null);

    const headerSelect = document.getElementById('header-unit-select');
    if (headerSelect) headerSelect.value = uId;

    window.dispatchEvent(new CustomEvent('unitChanged'));
  });

  await loadData();

  window.addEventListener('periodeChanged', handleGlobalFilterChange);
  window.addEventListener('unitChanged', handleGlobalFilterChange);
};

export const destroy = () => {
  window.removeEventListener('periodeChanged', handleGlobalFilterChange);
  window.removeEventListener('unitChanged', handleGlobalFilterChange);
};
