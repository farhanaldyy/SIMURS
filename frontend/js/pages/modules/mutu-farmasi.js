import Store from '../../store.js';
import { api } from '../../api/client.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = {
  records: [],
  activePeriodRecords: {}
};

const TYPES = [
  { key: 'double_check', label: 'Kepatuhan Pelaksanaan Double Check Obat High Alert', target: '≥ 80%' },
  { key: 'tidak_tersedia_rajal', label: 'Ketidaktersediaan Obat di Farmasi di Rawat Jalan', target: '≤ 5%' },
  { key: 'tidak_tersedia_ranap', label: 'Ketidaktersediaan Obat di Farmasi di Rawat Inap', target: '≤ 5%' },
  { key: 'waktu_tunggu', label: 'Waktu Tunggu Obat Racikan dan Non Racikan', target: 'Racikan <= 60 Menit & Non-Racikan <= 30 Menit' },
  { key: 'rata_waktu_tunggu', label: 'Rata-Rata Waktu Tunggu Obat', target: 'Racikan < 60 Menit & Non-Racikan < 30 Menit' }
];

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatPeriod(periodId) {
  const p = Store.periodeList?.find(x => x.id === periodId);
  if (!p) return `Periode ID: ${periodId}`;
  return `${monthNames[p.bulan]} ${p.tahun}`;
}

function sortRecordsByPeriod(recordsList) {
  return recordsList.sort((a, b) => {
    const pa = Store.periodeList?.find(x => x.id === a.periode_id);
    const pb = Store.periodeList?.find(x => x.id === b.periode_id);
    if (!pa || !pb) return b.periode_id - a.periode_id;
    if (pa.tahun !== pb.tahun) return pb.tahun - pa.tahun;
    return pb.bulan - pa.bulan;
  });
}

async function loadData() {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    TYPES.forEach(t => {
      const c = document.getElementById(`table-body-${t.key}`);
      if (c) {
        const colSpan = (t.key === 'double_check' || t.key === 'rata_waktu_tunggu') ? 6 : 5;
        c.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--color-muted);">Pilih periode di bagian atas terlebih dahulu.</td></tr>`;
      }
    });
    return;
  }

  const res = await api.get('/mutu-farmasi');
  if (res.success) {
    state.records = res.data;
  } else {
    showToast('Gagal memuat data indikator', 'error');
    state.records = [];
  }

  state.activePeriodRecords = {};
  state.records.forEach(r => {
    if (r.periode_id === activePeriodId) {
      state.activePeriodRecords[r.tipe] = r;
    }
  });

  TYPES.forEach(t => {
    renderSummaryBar(t.key);
    renderTableBody(t.key);
  });
}

function renderSummaryBar(type) {
  const container = document.querySelector(`.summary-bar-${type}`);
  if (!container) return;

  const record = state.activePeriodRecords[type];
  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : '-';

  if (!record) {
    container.innerHTML = `
      <div style="background: var(--bg-light); border-left: 4px solid var(--color-warning); padding: 12px 16px; border-radius: 4px; font-size: 0.95rem;">
        <span style="font-weight: 600;">Belum ada data untuk periode aktif (${activePeriodName}).</span> Silakan klik tombol di kanan atas untuk menginput data.
      </div>
    `;
    return;
  }

  const v1 = record.val1;
  const v2 = record.val2;
  const v3 = record.val3;
  const v4 = record.val4;

  let detailsHTML = '';
  if (type === 'double_check') {
    const compliance = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
    const tidakDoubleCheck = v1 - v2;
    const pctTidakDoubleCheck = v1 > 0 ? ((tidakDoubleCheck / v1) * 100).toFixed(2) : '0.00';
    const isTargetAchieved = parseFloat(compliance) >= 80;
    const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
    const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

    detailsHTML = `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
        <div style="flex: 1; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Capaian (${activePeriodName})</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${compliance}%</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Total Obat (D)</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${v1}</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Total Double Check (N)</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${v2}</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Tidak Double Check</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${tidakDoubleCheck} (${pctTidakDoubleCheck}%)</div>
        </div>
        <div style="display: flex; align-items: center;">
          <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
        </div>
      </div>
    `;
  } else if (type === 'tidak_tersedia_rajal' || type === 'tidak_tersedia_ranap') {
    const unavailability = v1 > 0 ? (v2 / v1).toFixed(4) : '0.00';
    const isTargetAchieved = parseFloat(unavailability) <= 5;
    const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
    const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

    detailsHTML = `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
        <div style="flex: 1; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Capaian (${activePeriodName})</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${unavailability}%</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Total Obat (D)</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${v1}</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Total Tidak Tersedia (N)</div>
          <div style="font-size: 1.25rem; font-weight: 600;">${v2}</div>
        </div>
        <div style="display: flex; align-items: center;">
          <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
        </div>
      </div>
    `;
  } else if (type === 'waktu_tunggu') {
    const totalObat = v1 + v3;
    const totalTunggu = v2 + v4;
    const compliance = totalObat > 0 ? ((totalTunggu / totalObat) * 100).toFixed(2) : '0.00';
    const racikanPct = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
    const nonRacikanPct = v3 > 0 ? ((v4 / v3) * 100).toFixed(2) : '0.00';

    detailsHTML = `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
        <div style="flex: 1; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Capaian Gabungan (${activePeriodName})</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${compliance}%</div>
        </div>
        <div style="flex: 1; min-width: 130px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Racikan (<= 60m)</div>
          <div style="font-size: 1.15rem; font-weight: 600;">${v2} / ${v1} (${racikanPct}%)</div>
        </div>
        <div style="flex: 1; min-width: 130px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Non Racikan (<= 30m)</div>
          <div style="font-size: 1.15rem; font-weight: 600;">${v4} / ${v3} (${nonRacikanPct}%)</div>
        </div>
      </div>
    `;
  } else if (type === 'rata_waktu_tunggu') {
    const isRacikanAchieved = v1 < 60;
    const isNonRacikanAchieved = v2 < 30;
    const isTargetAchieved = isRacikanAchieved && isNonRacikanAchieved;
    const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
    const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

    detailsHTML = `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
        <div style="flex: 1; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Rata-Rata Racikan</div>
          <div style="font-size: 1.4rem; font-weight: 700; color: ${isRacikanAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${v1} Menit</div>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <div style="font-size: 0.85rem; color: var(--text-light);">Rata-Rata Non-Racikan</div>
          <div style="font-size: 1.4rem; font-weight: 700; color: ${isNonRacikanAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${v2} Menit</div>
        </div>
        <div style="display: flex; align-items: center;">
          <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = detailsHTML;
}

function getTableHeadersHTML(type) {
  if (type === 'double_check') {
    return `
      <tr>
        <th>Bulan / Periode</th>
        <th style="text-align: center;">Total Obat (D)</th>
        <th style="text-align: center;">Total Double Check (N)</th>
        <th style="text-align: center;">Tidak Double Check</th>
        <th style="text-align: center;">Persentase (%)</th>
        <th style="text-align: center; width: 100px;">Aksi</th>
      </tr>
    `;
  } else if (type === 'tidak_tersedia_rajal' || type === 'tidak_tersedia_ranap') {
    return `
      <tr>
        <th>Bulan / Periode</th>
        <th style="text-align: center;">Total Obat (D)</th>
        <th style="text-align: center;">Total Tidak Tersedia (N)</th>
        <th style="text-align: center;">Persentase (%)</th>
        <th style="text-align: center; width: 100px;">Aksi</th>
      </tr>
    `;
  } else if (type === 'waktu_tunggu') {
    return `
      <tr>
        <th>Bulan / Periode</th>
        <th style="text-align: center;">Racikan (D/N)</th>
        <th style="text-align: center;">Non-Racikan (D/N)</th>
        <th style="text-align: center;">Persentase Gabungan (%)</th>
        <th style="text-align: center; width: 100px;">Aksi</th>
      </tr>
    `;
  } else if (type === 'rata_waktu_tunggu') {
    return `
      <tr>
        <th>Bulan / Periode</th>
        <th style="text-align: center;">Rata-Rata Racikan</th>
        <th style="text-align: center;">Rata-Rata Non-Racikan</th>
        <th style="text-align: center;">Status Target</th>
        <th style="text-align: center; width: 100px;">Aksi</th>
      </tr>
    `;
  }
}

function renderTableBody(type) {
  const container = document.getElementById(`table-body-${type}`);
  if (!container) return;

  const typeRecords = state.records.filter(r => r.tipe === type);
  if (typeRecords.length === 0) {
    const colSpan = (type === 'double_check' || type === 'rata_waktu_tunggu') ? 6 : 5;
    container.innerHTML = `
      <tr>
        <td colspan="${colSpan}" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data historis.</td>
      </tr>
    `;
    return;
  }

  sortRecordsByPeriod(typeRecords);

  const rows = typeRecords.map(r => {
    const canDelete = Store.canDelete();
    const v1 = r.val1;
    const v2 = r.val2;
    const v3 = r.val3;
    const v4 = r.val4;

    if (type === 'double_check') {
      const compliance = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
      const tidakDoubleCheck = v1 - v2;
      const isTargetAchieved = parseFloat(compliance) >= 80;

      return `
        <tr>
          <td><strong>${formatPeriod(r.periode_id)}</strong></td>
          <td style="text-align: center;">${v1}</td>
          <td style="text-align: center;">${v2}</td>
          <td style="text-align: center;">${tidakDoubleCheck}</td>
          <td style="text-align: center; font-weight: bold; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${compliance}%</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" data-type="${type}">Edit</button>
              ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    } else if (type === 'tidak_tersedia_rajal' || type === 'tidak_tersedia_ranap') {
      const unavailability = v1 > 0 ? (v2 / v1).toFixed(4) : '0.00';
      const isTargetAchieved = parseFloat(unavailability) <= 5;

      return `
        <tr>
          <td><strong>${formatPeriod(r.periode_id)}</strong></td>
          <td style="text-align: center;">${v1}</td>
          <td style="text-align: center;">${v2}</td>
          <td style="text-align: center; font-weight: bold; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${unavailability}%</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" data-type="${type}">Edit</button>
              ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    } else if (type === 'waktu_tunggu') {
      const totalObat = v1 + v3;
      const totalTunggu = v2 + v4;
      const compliance = totalObat > 0 ? ((totalTunggu / totalObat) * 100).toFixed(2) : '0.00';
      const racikanPct = v1 > 0 ? ((v2 / v1) * 100).toFixed(2) : '0.00';
      const nonRacikanPct = v3 > 0 ? ((v4 / v3) * 100).toFixed(2) : '0.00';

      return `
        <tr>
          <td><strong>${formatPeriod(r.periode_id)}</strong></td>
          <td style="text-align: center;">${v2} / ${v1} (${racikanPct}%)</td>
          <td style="text-align: center;">${v4} / ${v3} (${nonRacikanPct}%)</td>
          <td style="text-align: center; font-weight: bold; color: var(--color-primary);">${compliance}%</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" data-type="${type}">Edit</button>
              ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    } else if (type === 'rata_waktu_tunggu') {
      const isRacikanAchieved = v1 < 60;
      const isNonRacikanAchieved = v2 < 30;
      const isTargetAchieved = isRacikanAchieved && isNonRacikanAchieved;

      return `
        <tr>
          <td><strong>${formatPeriod(r.periode_id)}</strong></td>
          <td style="text-align: center;">${v1} Menit</td>
          <td style="text-align: center;">${v2} Menit</td>
          <td style="text-align: center;">
            <span class="badge ${isTargetAchieved ? 'badge-success' : 'badge-danger'}">
              ${isTargetAchieved ? 'Tercapai' : 'Belum Tercapai'}
            </span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" data-type="${type}">Edit</button>
              ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }
  }).join('');

  container.innerHTML = rows;

  container.querySelectorAll('.btn-edit-record').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = state.records.find(x => x.id == btn.dataset.id);
      if (rec) openInputModal(btn.dataset.type, rec);
    });
  });

  container.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteRecord(parseInt(btn.dataset.id));
    });
  });
}

function openInputModal(type, record = null) {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    showToast('Pilih periode pelaporan di bagian atas terlebih dahulu', 'warning');
    return;
  }

  const activePeriodName = `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}`;
  const isEdit = !!record;

  let formFieldsHTML = '';
  if (type === 'double_check') {
    formFieldsHTML = `
      <div class="form-group">
        <label class="form-label">Total Obat High Alert (D) <span class="required">*</span></label>
        <input type="number" name="val1" class="form-control" value="${record ? record.val1 : 0}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah total resep/obat high alert yang terverifikasi.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Total Double Check (N) <span class="required">*</span></label>
        <input type="number" name="val2" class="form-control" value="${record ? record.val2 : 0}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah resep/obat high alert yang dilakukan verifikasi ganda.</small>
      </div>
    `;
  } else if (type === 'tidak_tersedia_rajal' || type === 'tidak_tersedia_ranap') {
    formFieldsHTML = `
      <div class="form-group">
        <label class="form-label">Total Obat (D) <span class="required">*</span></label>
        <input type="number" name="val1" class="form-control" value="${record ? record.val1 : 0}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah total resep yang diterima.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Total Tidak Tersedia (N) <span class="required">*</span></label>
        <input type="number" name="val2" class="form-control" value="${record ? record.val2 : 0}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah resep obat yang tidak dapat disediakan.</small>
      </div>
    `;
  } else if (type === 'waktu_tunggu') {
    formFieldsHTML = `
      <div class="form-group">
        <label class="form-label">Total Obat Racikan <span class="required">*</span></label>
        <input type="number" name="val1" class="form-control" value="${record ? record.val1 : 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Total Tunggu Racikan <= 60 Menit <span class="required">*</span></label>
        <input type="number" name="val2" class="form-control" value="${record ? record.val2 : 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Total Obat Non Racikan <span class="required">*</span></label>
        <input type="number" name="val3" class="form-control" value="${record ? record.val3 : 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Total Tunggu Non Racikan <= 30 Menit <span class="required">*</span></label>
        <input type="number" name="val4" class="form-control" value="${record ? record.val4 : 0}" min="0" required>
      </div>
    `;
  } else if (type === 'rata_waktu_tunggu') {
    formFieldsHTML = `
      <div class="form-group">
        <label class="form-label">Rata-Rata Waktu Tunggu Racikan (Menit) <span class="required">*</span></label>
        <input type="number" name="val1" class="form-control" value="${record ? record.val1 : 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Rata-Rata Waktu Tunggu Non-Racikan (Menit) <span class="required">*</span></label>
        <input type="number" name="val2" class="form-control" value="${record ? record.val2 : 0}" min="0" required>
      </div>
    `;
  }

  const modalHTML = `
    <form id="farmasi-form">
      <div class="form-group">
        <label class="form-label">Bulan / Periode</label>
        <input type="text" class="form-control" value="${record ? formatPeriod(record.periode_id) : activePeriodName}" disabled>
      </div>
      ${formFieldsHTML}
    </form>
  `;

  const typeName = TYPES.find(t => t.key === type)?.label || 'Indikator';

  showModal(isEdit ? `Edit Data - ${typeName}` : `Input Data - ${typeName}`, modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('farmasi-form');
      const formData = Object.fromEntries(new FormData(form));

      const payload = {
        periode_id: record ? record.periode_id : activePeriodId,
        tipe: type,
        val1: parseInt(formData.val1 || 0),
        val2: parseInt(formData.val2 || 0),
        val3: formData.val3 !== undefined ? parseInt(formData.val3 || 0) : 0,
        val4: formData.val4 !== undefined ? parseInt(formData.val4 || 0) : 0
      };

      if (payload.val1 < 0 || payload.val2 < 0 || payload.val3 < 0 || payload.val4 < 0) {
        showToast('Nilai input tidak boleh negatif', 'error');
        return;
      }

      const res = await api.post('/mutu-farmasi', payload);
      if (res.success) {
        showToast('Data berhasil disimpan', 'success');
        closeModal();
        await loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan data', 'error');
      }
    }
  });
}

async function handleDeleteRecord(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

  const res = await api.delete(`/mutu-farmasi/${id}`);
  if (res.success) {
    showToast('Data berhasil dihapus', 'success');
    await loadData();
  } else {
    showToast(res.message || 'Gagal menghapus data', 'error');
  }
}

function handleFilterChange() {
  loadData();
}

export const render = async (container) => {
  container.innerHTML = `
    <div class="module-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Standar Minimal Mutu Farmasi</h1>
          <p class="page-subtitle">Pencatatan indikator mutu pelayanan Instalasi Farmasi</p>
        </div>
      </div>

      <!-- Prominent User Constraints Notice -->
      <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--color-danger); padding: 16px; border-radius: 8px; margin-top: 24px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; border: 1px solid rgba(239, 68, 68, 0.15);">
        <div style="font-size: 1.25rem; line-height: 1;">⚠️</div>
        <div>
          <h4 style="margin: 0 0 4px 0; font-weight: 600; color: var(--color-danger);">Penting / Catatan Penting:</h4>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-primary); line-height: 1.4;">Hanya satu kali input setiap bulan, dan jangan lupa untuk setting periode bulan sebelum input, untuk meminimalisir kesalahan.</p>
        </div>
      </div>

      <div class="cards-container" style="display: flex; flex-direction: column; gap: 32px;">
        ${TYPES.map(t => `
          <div class="card" id="card-${t.key}" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">${t.label}</h3>
                <span class="badge badge-outline" style="margin-top: 4px; display: inline-block;">Target: ${t.target}</span>
              </div>
              <button class="btn btn-primary btn-add-data" data-type="${t.key}">+ Input / Edit Data Bulan Ini</button>
            </div>

            <div class="summary-bar-${t.key}" style="margin-bottom: 20px;"></div>

            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  ${getTableHeadersHTML(t.key)}
                </thead>
                <tbody id="table-body-${t.key}">
                  <tr><td colspan="${(t.key === 'double_check' || t.key === 'rata_waktu_tunggu') ? 6 : 5}" style="text-align: center; color: var(--color-muted);">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.btn-add-data').forEach(btn => {
    btn.addEventListener('click', () => openInputModal(btn.dataset.type));
  });

  await loadData();

  window.addEventListener('periodeChanged', handleFilterChange);
};

export const destroy = () => {
  window.removeEventListener('periodeChanged', handleFilterChange);
};
