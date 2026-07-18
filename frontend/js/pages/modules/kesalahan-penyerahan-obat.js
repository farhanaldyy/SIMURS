import Store from '../../store.js';
import { api } from '../../api/client.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = {
  records: []
};

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

async function loadData() {
  const activePeriodId = Store.periodeAktif?.id;
  const container = document.getElementById('table-body-kesalahan');
  if (!container) return;

  if (!activePeriodId) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Pilih periode di bagian atas terlebih dahulu.</td></tr>`;
    return;
  }

  const res = await api.get(`/kesalahan-penyerahan-obat?periode_id=${activePeriodId}`);
  if (res.success) {
    state.records = res.data;
  } else {
    state.records = [];
  }

  renderSummary();
  renderTable();
}

function renderSummary() {
  const summaryContainer = document.getElementById('summary-bar-kesalahan');
  if (!summaryContainer) return;

  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : '-';

  if (state.records.length === 0) {
    summaryContainer.innerHTML = `
      <div style="background: var(--bg-light); border-left: 4px solid var(--color-warning); padding: 12px 16px; border-radius: 4px; font-size: 0.95rem;">
        <span style="font-weight: 600;">Belum ada data untuk periode aktif (${activePeriodName}).</span> Silakan klik tombol di kanan atas untuk menginput data.
      </div>
    `;
    return;
  }

  let totalResep = 0;
  let totalSalah = 0;
  let sumPercentage = 0;

  state.records.forEach(r => {
    const jResep = r.resep_rajal + r.resep_ranap + r.resep_igd;
    const jSalah = r.salah_rajal + r.salah_ranap + r.salah_igd;
    totalResep += jResep;
    totalSalah += jSalah;
    const dailyPersen = jSalah === 0 ? 100 : parseFloat(((jResep / jSalah) * 100).toFixed(2));
    sumPercentage += dailyPersen;
  });

  const avgPersen = state.records.length > 0 ? parseFloat((sumPercentage / state.records.length).toFixed(2)) : 100;
  const isTargetAchieved = avgPersen === 100;
  const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
  const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

  summaryContainer.innerHTML = `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%;">
      <div style="flex: 1; min-width: 150px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Rata-Rata Kepatuhan (${activePeriodName})</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">${avgPersen.toFixed(2)}%</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Total Lembar Resep</div>
        <div style="font-size: 1.25rem; font-weight: 600;">${totalResep}</div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-size: 0.85rem; color: var(--text-light);">Total Kesalahan Kejadian</div>
        <div style="font-size: 1.25rem; font-weight: 600; color: ${totalSalah > 0 ? 'var(--color-danger)' : 'var(--text-primary)'};">${totalSalah}</div>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="badge ${badgeClass}" style="font-size: 0.95rem; padding: 6px 12px;">${badgeText}</span>
      </div>
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById('table-body-kesalahan');
  if (!container) return;

  if (state.records.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data harian untuk periode aktif ini.</td>
      </tr>
    `;
    return;
  }

  const canDelete = Store.canDelete();
  container.innerHTML = state.records.map(r => {
    const resepTotal = r.resep_rajal + r.resep_ranap + r.resep_igd;
    const salahTotal = r.salah_rajal + r.salah_ranap + r.salah_igd;
    const pct = salahTotal === 0 ? 100 : (resepTotal / salahTotal) * 100;
    const formattedDate = new Date(r.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
      <tr>
        <td><strong>${formattedDate}</strong></td>
        <td style="text-align: center;">${r.resep_rajal} / ${r.resep_ranap} / ${r.resep_igd} <strong>(${resepTotal})</strong></td>
        <td style="text-align: center;">${r.salah_rajal} / ${r.salah_ranap} / ${r.salah_igd} <strong>(${salahTotal})</strong></td>
        <td style="text-align: center; font-weight: bold; color: ${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${pct.toFixed(2)}%</td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit" data-id="${r.id}">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = state.records.find(x => x.id == btn.dataset.id);
      if (rec) openInputModal(rec);
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDelete(parseInt(btn.dataset.id));
    });
  });
}

function openInputModal(record = null) {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    showToast('Pilih periode pelaporan di bagian atas terlebih dahulu', 'warning');
    return;
  }

  const isEdit = !!record;
  const defaultDate = record ? new Date(record.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const modalHTML = `
    <form id="kesalahan-obat-form">
      <input type="hidden" name="id" value="${record ? record.id : ''}">
      <div class="form-group">
        <label class="form-label">Tanggal Kejadian <span class="required">*</span></label>
        <input type="date" name="tanggal" class="form-control" value="${defaultDate}" required>
      </div>
      
      <h4 style="margin: 16px 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Lembar Resep</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Rawat Jalan</label>
          <input type="number" name="resep_rajal" class="form-control" value="${record ? record.resep_rajal : 0}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Rawat Inap</label>
          <input type="number" name="resep_ranap" class="form-control" value="${record ? record.resep_ranap : 0}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">IGD</label>
          <input type="number" name="resep_igd" class="form-control" value="${record ? record.resep_igd : 0}" min="0">
        </div>
      </div>

      <h4 style="margin: 16px 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Kesalahan Penyerahan</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Rawat Jalan</label>
          <input type="number" name="salah_rajal" class="form-control" value="${record ? record.salah_rajal : 0}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Rawat Inap</label>
          <input type="number" name="salah_ranap" class="form-control" value="${record ? record.salah_ranap : 0}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">IGD</label>
          <input type="number" name="salah_igd" class="form-control" value="${record ? record.salah_igd : 0}" min="0">
        </div>
      </div>
    </form>
  `;

  showModal(isEdit ? 'Edit Log Kesalahan Penyerahan' : 'Tambah Log Kesalahan Penyerahan', modalHTML, {
    confirmText: 'Simpan',
    onConfirm: async () => {
      const form = document.getElementById('kesalahan-obat-form');
      const formData = Object.fromEntries(new FormData(form));

      const payload = {
        id: formData.id ? parseInt(formData.id) : undefined,
        periode_id: activePeriodId,
        tanggal: formData.tanggal,
        resep_rajal: parseInt(formData.resep_rajal || 0),
        resep_ranap: parseInt(formData.resep_ranap || 0),
        resep_igd: parseInt(formData.resep_igd || 0),
        salah_rajal: parseInt(formData.salah_rajal || 0),
        salah_ranap: parseInt(formData.salah_ranap || 0),
        salah_igd: parseInt(formData.salah_igd || 0)
      };

      const res = await api.post('/kesalahan-penyerahan-obat', payload);
      if (res.success) {
        showToast('Log harian berhasil disimpan', 'success');
        closeModal();
        await loadData();
      } else {
        showToast(res.message || 'Gagal menyimpan log harian', 'error');
      }
    }
  });
}

async function handleDelete(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data log harian ini?')) return;

  const res = await api.delete(`/kesalahan-penyerahan-obat/${id}`);
  if (res.success) {
    showToast('Log harian berhasil dihapus', 'success');
    await loadData();
  } else {
    showToast(res.message || 'Gagal menghapus log harian', 'error');
  }
}

export default {
  render: async (container) => {
    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Kesalahan Penyerahan Obat Kepada Pasien (Rawat Jalan, Inap dan IGD)</h3>
              <span class="badge badge-outline" style="margin-top: 4px; display: inline-block;">Target: 100% Benar (0% Kesalahan)</span>
            </div>
            <button class="btn btn-primary btn-add">+ Tambah Log Kejadian Harian</button>
          </div>

          <div id="summary-bar-kesalahan" style="margin-bottom: 20px;"></div>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th style="text-align: center;">Resep Rajal / Ranap / IGD (Total)</th>
                  <th style="text-align: center;">Salah Rajal / Ranap / IGD (Total)</th>
                  <th style="text-align: center;">Kepatuhan (%)</th>
                  <th style="text-align: center; width: 120px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-body-kesalahan">
                <tr><td colspan="5" style="text-align: center; color: var(--color-muted);">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelector('.btn-add').addEventListener('click', () => openInputModal());

    // Listen for global period changes
    window.addEventListener('periodChanged', loadData);

    await loadData();
  },

  destroy: () => {
    window.removeEventListener('periodChanged', loadData);
  }
};
