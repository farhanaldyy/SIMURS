import Store from '../store.js';
import { api } from '../api/client.js';
import { showToast } from '../components/toast.js';

let state = { summaries: {} };

async function loadData() {
  const pid = Store.periodeAktif?.id;
  const uid = Store.unitAktif?.id;

  // Update print subtitle dynamically
  const printSubtitle = document.getElementById('print-subtitle');
  if (printSubtitle) {
    const bulanNama = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const pBulan = Store.periodeAktif ? bulanNama[Store.periodeAktif.bulan - 1] : '';
    const pTahun = Store.periodeAktif ? Store.periodeAktif.tahun : '';
    const unitText = Store.unitAktif ? `| Unit: ${Store.unitAktif.nama_unit}` : '| Unit: Semua Unit';
    printSubtitle.innerHTML = `Periode: ${pBulan} ${pTahun} ${unitText}`;
  }

  const printDate = document.getElementById('print-date');
  if (printDate) {
    printDate.innerHTML = `Kendal, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }

  if (!pid) {
    const previewBody = document.getElementById('report-summary-table-body');
    if (previewBody) {
      previewBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-muted); padding: 24px;">Pilih periode terlebih dahulu.</td></tr>';
    }
    return;
  }

  let url = `/dashboard/indicator-summaries?periode_id=${pid}`;
  if (uid) url += `&unit_id=${uid}`;

  const res = await api.get(url);
  if (res.success) {
    state.summaries = res.data;
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

  // Gizi
  'Ketepatan Waktu Makanan': '#/gizi-waktu-makanan',
  'Sisa Makanan Pasien': '#/gizi-sisa-makanan',
  'Akurasi Pemberian Diet': '#/gizi-kesalahan-diet',
  'Identifikasi Pasien SIMRS': '#/gizi-identifikasi-pasien',

  // Rawat Jalan
  'Waktu Tunggu Poliklinik': '#/waktu-tunggu-poliklinik',
  'Waktu Tunggu Operasi Elektif': '#/waktu-tunggu-operasi-elektif',

  // Laundry
  'Ketepatan Waktu Penyediaan Linen Bersih': '#/laundry-ketepatan-linen',
  'Tidak Adanya Kejadian Linen Hilang': '#/laundry-linen-hilang'
};

function renderReportTable() {
  const container = document.getElementById('report-summary-table-body');
  if (!container) return;

  const user = Store.get('user');
  const role = user ? user.role : '';
  let allowed = [];
  if (user && user.allowed_modules) {
    try {
      allowed = JSON.parse(user.allowed_modules);
    } catch (e) {
      allowed = [];
    }
  }

  let entries = Object.entries(state.summaries);
  if (role === 'petugas') {
    entries = entries.filter(([name]) => {
      const hash = serviceToHash[name];
      return hash && allowed.includes(hash);
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
      const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
      const rVal = parseFloat(s.rataRata);
      if (s.standar.includes('≤')) {
        achieved = rVal <= targetVal;
      } else {
        achieved = rVal >= targetVal;
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
  const pid = Store.periodeAktif?.id;
  const uid = Store.unitAktif?.id;
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
    
    let filename = `Laporan_Mutu_${Store.periodeAktif.bulan}_${Store.periodeAktif.tahun}.xlsx`;
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

async function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  showToast('Mengimpor data Excel...', 'info');

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
      loadData();
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
    filterUnit.innerHTML = '<option value="">Semua Unit</option>' +
      Store.unitList.map(u => {
        const selected = Store.unitAktif && Store.unitAktif.id === u.id ? 'selected' : '';
        return `<option value="${u.id}" ${selected}>${u.nama_unit}</option>`;
      }).join('');
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
        <div style="display: flex; gap: 16px;">
          <button class="btn btn-primary" id="btn-export-excel">📁 Unduh Excel (.xlsx)</button>
          <button class="btn btn-outline" id="btn-print-pdf">🖨️ Cetak PDF / Print</button>
        </div>
      </div>

      ${Store.isAdmin() ? `
        <div class="card" style="margin-bottom: 24px; padding: 24px;">
          <h3 style="margin-top: 0; margin-bottom: 8px;">Migrasi Data (Import Excel)</h3>
          <p style="color: var(--text-light); margin-bottom: 16px; font-size: 0.9rem;">
            Unggah file rekap manual (.xlsx) untuk memigrasikan data lama ke dalam periode aktif.
          </p>
          <input type="file" id="input-import-excel" accept=".xlsx" style="display: none;">
          <button class="btn btn-outline" onclick="document.getElementById('input-import-excel').click()">📥 Pilih File & Import</button>
        </div>
      ` : ''}

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
      <div style="display: flex; align-items: center; justify-content: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 24px;">
        <img src="assets/img/logo.png" alt="Logo" style="width: 60px; height: 60px; margin-right: 16px;">
        <div style="text-align: center;">
          <h1 style="margin: 0; font-size: 1.6rem; font-weight: 700; color: #000; letter-spacing: 0.5px;">RUMAH SAKIT ISLAM KARAWANG</h1>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #444;">Jl. Ar-Rahman No. 20, Kendal, Jawa Tengah</p>
          <p style="margin: 1px 0 0 0; font-size: 0.8rem; color: #666; font-style: italic;">Telp: (0294) 123456 | Email: info@rsi-kendal.co.id</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 1.3rem; font-weight: 600; text-decoration: underline;">LAPORAN CAPAIAN INDIKATOR MUTU</h2>
        <div id="print-subtitle" style="margin-top: 6px; font-size: 0.95rem; font-weight: 500;">
          Periode: - | Unit: -
        </div>
      </div>
      
      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th style="width: 150px; text-align: left;">Kategori</th>
            <th style="text-align: left;">Nama Indikator</th>
            <th style="width: 100px; text-align: center;">Target</th>
            <th style="width: 100px; text-align: center;">Pencapaian</th>
            <th style="width: 130px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody id="print-table-body">
          <!-- Populated dynamically -->
        </tbody>
      </table>
      
      <div style="margin-top: 48px; display: flex; justify-content: flex-end;">
        <div style="text-align: center; width: 250px; font-size: 0.9rem;">
          <div id="print-date">Kendal, -</div>
          <div style="margin-top: 8px; font-weight: 600;">Komite Mutu & Keselamatan Pasien</div>
          <div style="margin-top: 70px; font-weight: 600;">( ___________________________ )</div>
        </div>
      </div>
    </div>
  `;

  // Bind export/import events
  document.getElementById('btn-export-excel').addEventListener('click', downloadExcelFile);
  document.getElementById('btn-print-pdf').addEventListener('click', () => {
    const previewBody = document.getElementById('report-summary-table-body');
    const printBody = document.getElementById('print-table-body');
    if (previewBody && printBody) {
      printBody.innerHTML = previewBody.innerHTML;
    }
    window.print();
  });

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

    loadData();
    window.dispatchEvent(new CustomEvent('periodeChanged'));
  });

  filterUnit.addEventListener('change', (e) => {
    const uId = e.target.value;
    const unit = Store.unitList.find(u => u.id == uId);
    Store.set('unitAktif', unit || null);

    const headerSelect = document.getElementById('header-unit-select');
    if (headerSelect) headerSelect.value = uId;

    loadData();
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
