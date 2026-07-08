import Store from '../../store.js';
import { api } from '../../api/client.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = {
  records: [],
  activePeriodRecords: {}
};

const TYPES = [
  { key: 'kematian_meja_operasi', label: 'Kejadian Kematian di Meja Operasi' },
  { key: 'salah_sisi', label: 'Kejadian Operasi Salah Sisi' },
  { key: 'salah_orang', label: 'Kejadian Operasi Salah Orang' },
  { key: 'salah_prosedur', label: 'Kejadian Operasi Salah Prosedur / Tindakan' }
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

function calculateResult(totalKejadian, totalOperasi) {
  const tk = parseInt(totalKejadian || 0);
  const to = parseInt(totalOperasi || 0);
  if (to === 0) {
    return tk === 0 ? '100.00%' : '0.00%';
  }
  const safeOps = to - tk;
  return `${((safeOps / to) * 100).toFixed(2)}%`;
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
    const containers = TYPES.map(t => document.getElementById(`table-body-${t.key}`));
    containers.forEach(c => {
      if (c) c.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Pilih periode di bagian atas terlebih dahulu.</td></tr>';
    });
    return;
  }

  const res = await api.get('/mutu-kamar-operasi');
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

  const result = calculateResult(record.total_kejadian, record.total_operasi);
  const isTargetAchieved = result === '100.00%';
  const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
  const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

  container.innerHTML = `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
      <div style="flex: 1; min-width: 150px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Capaian ${activePeriodName}</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${result}</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Total Kejadian</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${record.total_kejadian}</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Total Operasi</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${record.total_operasi}</div>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
      </div>
    </div>
  `;
}

function renderTableBody(type) {
  const container = document.getElementById(`table-body-${type}`);
  if (!container) return;

  const typeRecords = state.records.filter(r => r.tipe === type);
  if (typeRecords.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data historis.</td>
      </tr>
    `;
    return;
  }

  sortRecordsByPeriod(typeRecords);

  const rows = typeRecords.map(r => {
    const result = calculateResult(r.total_kejadian, r.total_operasi);
    const isTargetAchieved = result === '100.00%';
    const canDelete = Store.canDelete();

    return `
      <tr>
        <td><strong>${formatPeriod(r.periode_id)}</strong></td>
        <td style="text-align: center;">${r.total_kejadian}</td>
        <td style="text-align: center;">${r.total_operasi}</td>
        <td style="text-align: center; font-weight: bold; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${result}</td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" data-type="${type}">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        </td>
      </tr>
    `;
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
  const initialKejadian = record ? record.total_kejadian : (state.activePeriodRecords[type]?.total_kejadian || 0);
  const initialOperasi = record ? record.total_operasi : (state.activePeriodRecords[type]?.total_operasi || 0);

  const modalHTML = `
    <form id="kamar-operasi-form">
      <div class="form-group">
        <label class="form-label">Bulan / Periode</label>
        <input type="text" class="form-control" value="${record ? formatPeriod(record.periode_id) : activePeriodName}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Total Kejadian <span class="required">*</span></label>
        <input type="number" name="total_kejadian" class="form-control" value="${initialKejadian}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah insiden keselamatan yang terjadi.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Total Operasi <span class="required">*</span></label>
        <input type="number" name="total_operasi" class="form-control" value="${initialOperasi}" min="0" required>
        <small style="color: var(--text-light); margin-top: 4px; display: block;">Jumlah seluruh operasi yang dilakukan pada periode ini.</small>
      </div>
    </form>
  `;

  const typeName = TYPES.find(t => t.key === type)?.label || 'Indikator';

  showModal(isEdit ? `Edit Data - ${typeName}` : `Input Data - ${typeName}`, modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('kamar-operasi-form');
      const formData = Object.fromEntries(new FormData(form));

      const payload = {
        periode_id: record ? record.periode_id : activePeriodId,
        tipe: type,
        total_kejadian: parseInt(formData.total_kejadian || 0),
        total_operasi: parseInt(formData.total_operasi || 0)
      };

      if (payload.total_kejadian < 0 || payload.total_operasi < 0) {
        showToast('Nilai input tidak boleh negatif', 'error');
        return;
      }

      const res = await api.post('/mutu-kamar-operasi', payload);
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

  const res = await api.delete(`/mutu-kamar-operasi/${id}`);
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
          <h1 class="page-title">Standar Minimal Mutu Kamar Operasi</h1>
          <p class="page-subtitle">Pencatatan indikator mutu pelayanan kamar operasi / bedah</p>
        </div>
      </div>

      <div class="cards-container" style="display: flex; flex-direction: column; gap: 32px; margin-top: 24px;">
        ${TYPES.map(t => `
          <div class="card" id="card-${t.key}" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">${t.label}</h3>
                <span class="badge badge-outline" style="margin-top: 4px; display: inline-block;">Target: 100% Keamanan</span>
              </div>
              <button class="btn btn-primary btn-add-data" data-type="${t.key}">+ Input / Edit Data Bulan Ini</button>
            </div>

            <div class="summary-bar-${t.key}" style="margin-bottom: 20px;"></div>

            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Bulan / Periode</th>
                    <th style="text-align: center;">Total Kejadian</th>
                    <th style="text-align: center;">Total Operasi</th>
                    <th style="text-align: center;">Persentase (Hasil)</th>
                    <th style="text-align: center; width: 100px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="table-body-${t.key}">
                  <tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Memuat data...</td></tr>
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
