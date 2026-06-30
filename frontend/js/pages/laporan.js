import Store from '../store.js';
import { api } from '../api/client.js';
import { showToast } from '../components/toast.js';

let state = { summaries: {} };

async function loadData() {
  const pid = Store.periodeAktif?.id;
  const uid = Store.unitAktif?.id;

  if (!pid) return;

  let url = `/dashboard/indicator-summaries?periode_id=${pid}`;
  if (uid) url += `&unit_id=${uid}`;

  const res = await api.get(url);
  if (res.success) {
    state.summaries = res.data;
    renderReportTable();
  }
}

function renderReportTable() {
  const container = document.getElementById('report-summary-table-body');
  if (!container) return;

  const rows = Object.entries(state.summaries).map(([name, s], idx) => {
    let achieved = false;
    let hasil = `${s.persen || 0}%`;

    if (s.rataRata !== undefined) {
      hasil = `${s.rataRata}`;
      // Parse targets like <= 5 or <= 240
      const targetVal = parseFloat(s.standar.replace(/[^\d.]/g, ''));
      if (s.standar.includes('≤')) {
        achieved = s.rataRata <= targetVal;
      } else {
        achieved = s.rataRata >= targetVal;
      }
    } else if (name.includes('Kematian') || name.includes('Kembali ICU') || name.includes('Clotting')) {
      hasil = `${s.total} Kasus`;
      achieved = s.total === 0; // Case counts target is usually 0 cases
    } else {
      achieved = parseFloat(s.persen) >= parseFloat(s.standar);
    }

    const badge = achieved 
      ? '<span class="badge badge-success">Tercapai</span>' 
      : '<span class="badge badge-danger">Belum Tercapai</span>';

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${s.category}</strong></td>
        <td>${name}</td>
        <td>${s.standar}</td>
        <td style="font-weight: bold">${hasil}</td>
        <td>${badge}</td>
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

export const render = async (container) => {
  const pBulan = Store.periodeAktif ? [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ][Store.periodeAktif.bulan - 1] : '';
  const pTahun = Store.periodeAktif ? Store.periodeAktif.tahun : '';

  container.innerHTML = `
    <div class="module-page no-print">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cetak & Ekspor Laporan</h1>
          <p class="page-subtitle">Unduh rekapitulasi data mutu bulanan format Excel/PDF</p>
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
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th>Kategori</th>
                <th>Nama Indikator</th>
                <th>Target Standar</th>
                <th>Hasil Pencapaian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="report-summary-table-body">
              <tr><td colspan="6" style="text-align: center; color: var(--text-light)">Memuat ringkasan data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Print-only layout container -->
    <div class="print-only">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0; font-size: 1.8rem; color: #1e293b;">LAPORAN CAPAIAN INDIKATOR MUTU</h1>
        <h2 style="margin: 4px 0 0 0; font-size: 1.3rem; color: #64748b;">RUMAH SAKIT ISLAM KENDAL</h2>
        <div style="margin-top: 8px; font-size: 1rem; color: #334155; font-weight: bold;">
          Periode: ${pBulan} ${pTahun} ${Store.unitAktif ? `| Unit: ${Store.unitAktif.nama_unit}` : ''}
        </div>
      </div>
      <table class="print-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; width: 40px;">No</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Kategori</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Nama Indikator</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Target</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Pencapaian</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody id="print-table-body">
          <!-- Populated dynamically during load -->
        </tbody>
      </table>
      <div style="margin-top: 48px; display: flex; justify-content: flex-end;">
        <div style="text-align: center; width: 250px;">
          <div>Kendal, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div style="margin-top: 8px; font-weight: bold;">Komite Mutu & Keselamatan Pasien</div>
          <div style="margin-top: 80px; border-top: 1px solid #000; width: 100%;"></div>
        </div>
      </div>
    </div>
  `;

  // Bind export/import events
  document.getElementById('btn-export-excel').addEventListener('click', downloadExcelFile);
  document.getElementById('btn-print-pdf').addEventListener('click', () => {
    // Copy summary rows to the print table body
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

  await loadData();
  window.addEventListener('periodeChanged', loadData);
  window.addEventListener('unitChanged', loadData);
};

export const destroy = () => {
  window.removeEventListener('periodeChanged', loadData);
  window.removeEventListener('unitChanged', loadData);
};
