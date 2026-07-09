import Store from '../../store.js';
import { api } from '../../api/client.js';
import { showModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

let state = {
  records: [],
  activePeriodRecord: null
};

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
  const container = document.getElementById('history-table-body');
  
  if (!activePeriodId) {
    if (container) {
      container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-muted);">Pilih periode di bagian atas terlebih dahulu.</td></tr>';
    }
    renderSummaryGrid();
    return;
  }

  const res = await api.get('/mutu-rekam-medis');
  if (res.success) {
    state.records = res.data;
  } else {
    showToast('Gagal memuat data Rekam Medis', 'error');
    state.records = [];
  }

  state.activePeriodRecord = state.records.find(r => r.periode_id === activePeriodId) || null;

  renderSummaryGrid();
  renderTableBody();
}

function renderSummaryGrid() {
  const container = document.getElementById('summary-grid-container');
  if (!container) return;

  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : '-';

  if (!state.activePeriodRecord) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: var(--bg-light); border-left: 4px solid var(--color-warning); padding: 16px; border-radius: 4px; font-size: 0.95rem;">
        <span style="font-weight: 600;">Belum ada data untuk periode aktif (${activePeriodName}).</span> Silakan klik tombol "+ Input / Edit Data Bulan Ini" di atas untuk memasukkan data.
      </div>
    `;
    return;
  }

  const r = state.activePeriodRecord;
  const indicators = [
    {
      title: 'Kelengkapan Ranap',
      num: r.kelengkapan_ranap_num,
      den: r.kelengkapan_ranap_den,
      pct: r.kelengkapan_ranap_pct,
      target: 100
    },
    {
      title: 'Pengembalian RM 24 Jam',
      num: r.pengembalian_num,
      den: r.pengembalian_den,
      pct: r.pengembalian_pct,
      target: 100
    },
    {
      title: 'Info Antrian Online',
      num: r.antrian_online_num,
      den: r.antrian_online_den,
      pct: r.antrian_online_pct,
      target: 85
    },
    {
      title: 'Ketepatan Coding',
      num: r.coding_num,
      den: r.coding_den,
      pct: r.coding_pct,
      target: 100
    },
    {
      title: 'Antrian Mobile JKN',
      num: r.mobile_jkn_num,
      den: r.mobile_jkn_den,
      pct: r.mobile_jkn_pct,
      target: 30
    }
  ];

  container.innerHTML = indicators.map(ind => {
    const isTargetAchieved = ind.pct >= ind.target;
    const badgeClass = isTargetAchieved ? 'badge-success' : 'badge-danger';
    const badgeText = isTargetAchieved ? 'Tercapai' : 'Belum Tercapai';

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
          ${ind.title}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 1.5rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${ind.pct.toFixed(2)}%
          </span>
          <span class="badge ${badgeClass}" style="font-size: 0.75rem; padding: 2px 6px;">${badgeText}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-light); display: flex; gap: 8px;">
          <span>Num: <strong>${ind.num}</strong></span>
          <span>Den: <strong>${ind.den}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

function renderTableBody() {
  const container = document.getElementById('history-table-body');
  if (!container) return;

  if (state.records.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--color-muted); padding: 16px;">Belum ada data historis.</td>
      </tr>
    `;
    return;
  }

  const sorted = sortRecordsByPeriod([...state.records]);
  const canDelete = Store.canDelete();

  container.innerHTML = sorted.map(r => {
    return `
      <tr>
        <td><strong>${formatPeriod(r.periode_id)}</strong></td>
        <td style="text-align: center; font-weight: 600; color: ${r.kelengkapan_ranap_pct >= 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${r.kelengkapan_ranap_pct.toFixed(2)}% <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light); block;">(${r.kelengkapan_ranap_num}/${r.kelengkapan_ranap_den})</span></td>
        <td style="text-align: center; font-weight: 600; color: ${r.pengembalian_pct >= 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${r.pengembalian_pct.toFixed(2)}% <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light); block;">(${r.pengembalian_num}/${r.pengembalian_den})</span></td>
        <td style="text-align: center; font-weight: 600; color: ${r.antrian_online_pct >= 85 ? 'var(--color-success)' : 'var(--color-danger)'};">${r.antrian_online_pct.toFixed(2)}% <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light); block;">(${r.antrian_online_num}/${r.antrian_online_den})</span></td>
        <td style="text-align: center; font-weight: 600; color: ${r.coding_pct >= 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${r.coding_pct.toFixed(2)}% <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light); block;">(${r.coding_num}/${r.coding_den})</span></td>
        <td style="text-align: center; font-weight: 600; color: ${r.mobile_jkn_pct >= 30 ? 'var(--color-success)' : 'var(--color-danger)'};">${r.mobile_jkn_pct.toFixed(2)}% <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light); block;">(${r.mobile_jkn_num}/${r.mobile_jkn_den})</span></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}">Hapus</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.querySelectorAll('.btn-edit-record').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = state.records.find(x => x.id == btn.dataset.id);
      if (rec) openInputModal(rec);
    });
  });

  container.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteRecord(parseInt(btn.dataset.id));
    });
  });
}

function setupFormListeners() {
  const form = document.getElementById('rekam-medis-form');
  if (!form) return;

  const indicators = [
    { num: 'kelengkapan_ranap_num', den: 'kelengkapan_ranap_den', preview: 'kelengkapan-ranap-pct-preview', target: 100 },
    { num: 'pengembalian_num', den: 'pengembalian_den', preview: 'pengembalian-pct-preview', target: 100 },
    { num: 'antrian_online_num', den: 'antrian_online_den', preview: 'antrian-online-pct-preview', target: 85 },
    { num: 'coding_num', den: 'coding_den', preview: 'coding-pct-preview', target: 100 },
    { num: 'mobile_jkn_num', den: 'mobile_jkn_den', preview: 'mobile-jkn-pct-preview', target: 30 }
  ];

  indicators.forEach(ind => {
    const numInput = form.querySelector(`[name="${ind.num}"]`);
    const denInput = form.querySelector(`[name="${ind.den}"]`);
    const previewEl = document.getElementById(ind.preview);

    if (numInput && denInput && previewEl) {
      const updatePct = () => {
        const num = parseInt(numInput.value || 0);
        const den = parseInt(denInput.value || 0);
        if (den > 0) {
          const pct = ((num / den) * 100).toFixed(2);
          previewEl.textContent = `${pct}%`;
          previewEl.style.color = pct >= ind.target ? 'var(--color-success)' : 'var(--color-danger)';
        } else {
          previewEl.textContent = '0.00%';
          previewEl.style.color = 'var(--text-light)';
        }
      };

      numInput.addEventListener('input', updatePct);
      denInput.addEventListener('input', updatePct);
      updatePct();
    }
  });
}

function openInputModal(record = null) {
  const activePeriodId = Store.periodeAktif?.id;
  if (!activePeriodId) {
    showToast('Pilih periode pelaporan di bagian atas terlebih dahulu', 'warning');
    return;
  }

  const activePeriodName = `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}`;
  const isEdit = !!record;
  const targetRecord = record || state.activePeriodRecord;

  const data = {
    kelengkapan_ranap_num: targetRecord ? targetRecord.kelengkapan_ranap_num : 0,
    kelengkapan_ranap_den: targetRecord ? targetRecord.kelengkapan_ranap_den : 0,
    pengembalian_num: targetRecord ? targetRecord.pengembalian_num : 0,
    pengembalian_den: targetRecord ? targetRecord.pengembalian_den : 0,
    antrian_online_num: targetRecord ? targetRecord.antrian_online_num : 0,
    antrian_online_den: targetRecord ? targetRecord.antrian_online_den : 0,
    coding_num: targetRecord ? targetRecord.coding_num : 0,
    coding_den: targetRecord ? targetRecord.coding_den : 0,
    mobile_jkn_num: targetRecord ? targetRecord.mobile_jkn_num : 0,
    mobile_jkn_den: targetRecord ? targetRecord.mobile_jkn_den : 0
  };

  const modalHTML = `
    <form id="rekam-medis-form" style="display: flex; flex-direction: column; gap: 16px; max-height: 60vh; overflow-y: auto; padding-right: 8px;">
      <div class="form-group" style="margin-bottom: 8px;">
        <label class="form-label" style="font-weight: bold;">Bulan / Periode Pelaporan</label>
        <input type="text" class="form-control" value="${record ? formatPeriod(record.periode_id) : activePeriodName}" disabled>
      </div>

      <!-- 1. Kelengkapan RM Ranap -->
      <div style="background: var(--bg-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          1. Kelengkapan Dokumen Rekam Medis Pasien Ranap
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 12px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Numerator (Lengkap) <span class="required">*</span></label>
            <input type="number" name="kelengkapan_ranap_num" class="form-control" value="${data.kelengkapan_ranap_num}" min="0" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Denumerator (Total RM) <span class="required">*</span></label>
            <input type="number" name="kelengkapan_ranap_den" class="form-control" value="${data.kelengkapan_ranap_den}" min="0" required>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="kelengkapan-ranap-pct-preview" style="font-weight: 700; font-size: 1rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 2. Pengembalian & Pengisian 1x24 Jam -->
      <div style="background: var(--bg-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          2. Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 12px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Numerator (Tepat) <span class="required">*</span></label>
            <input type="number" name="pengembalian_num" class="form-control" value="${data.pengembalian_num}" min="0" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Denumerator (Total RM) <span class="required">*</span></label>
            <input type="number" name="pengembalian_den" class="form-control" value="${data.pengembalian_den}" min="0" required>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="pengembalian-pct-preview" style="font-weight: 700; font-size: 1rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 3. Pemberian Informasi Antrian Online -->
      <div style="background: var(--bg-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          3. Pemberian Informasi Antrian Online <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light);">(Target: ≥ 85%)</span>
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 12px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Numerator (Diinfo) <span class="required">*</span></label>
            <input type="number" name="antrian_online_num" class="form-control" value="${data.antrian_online_num}" min="0" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Denumerator (Total Antrian) <span class="required">*</span></label>
            <input type="number" name="antrian_online_den" class="form-control" value="${data.antrian_online_den}" min="0" required>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="antrian-online-pct-preview" style="font-weight: 700; font-size: 1rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 4. Ketepatan Coding -->
      <div style="background: var(--bg-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          4. Ketepatan Coding Rawat Inap & Rawat Jalan
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 12px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Numerator (Tepat) <span class="required">*</span></label>
            <input type="number" name="coding_num" class="form-control" value="${data.coding_num}" min="0" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Denumerator (Total Berkas) <span class="required">*</span></label>
            <input type="number" name="coding_den" class="form-control" value="${data.coding_den}" min="0" required>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="coding-pct-preview" style="font-weight: 700; font-size: 1rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 5. Antrian Mobile JKN -->
      <div style="background: var(--bg-light); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 10px;">
        <h4 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          5. Antrian Mobile JKN <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light);">(Target: ≥ 30%)</span>
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 80px; gap: 12px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Numerator (Mobile JKN) <span class="required">*</span></label>
            <input type="number" name="mobile_jkn_num" class="form-control" value="${data.mobile_jkn_num}" min="0" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Denumerator (Total Antrian) <span class="required">*</span></label>
            <input type="number" name="mobile_jkn_den" class="form-control" value="${data.mobile_jkn_den}" min="0" required>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="mobile-jkn-pct-preview" style="font-weight: 700; font-size: 1rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>
    </form>
  `;

  showModal(
    isEdit ? 'Edit Mutu Rekam Medis' : 'Input Mutu Rekam Medis',
    modalHTML,
    {
      width: '600px',
      confirmText: 'Simpan',
      onConfirm: async () => {
        const form = document.getElementById('rekam-medis-form');
        const formData = Object.fromEntries(new FormData(form));

        const payload = {
          periode_id: record ? record.periode_id : activePeriodId,
          kelengkapan_ranap_num: parseInt(formData.kelengkapan_ranap_num || 0),
          kelengkapan_ranap_den: parseInt(formData.kelengkapan_ranap_den || 0),
          pengembalian_num: parseInt(formData.pengembalian_num || 0),
          pengembalian_den: parseInt(formData.pengembalian_den || 0),
          antrian_online_num: parseInt(formData.antrian_online_num || 0),
          antrian_online_den: parseInt(formData.antrian_online_den || 0),
          coding_num: parseInt(formData.coding_num || 0),
          coding_den: parseInt(formData.coding_den || 0),
          mobile_jkn_num: parseInt(formData.mobile_jkn_num || 0),
          mobile_jkn_den: parseInt(formData.mobile_jkn_den || 0)
        };

        // Simple validation: Numerators should not exceed Denominators (optional, but standard for completeness metrics)
        const exceeds = [];
        if (payload.kelengkapan_ranap_num > payload.kelengkapan_ranap_den) exceeds.push('Kelengkapan Ranap');
        if (payload.pengembalian_num > payload.pengembalian_den) exceeds.push('Pengembalian RM');
        if (payload.antrian_online_num > payload.antrian_online_den) exceeds.push('Antrian Online');
        if (payload.coding_num > payload.coding_den) exceeds.push('Ketepatan Coding');
        if (payload.mobile_jkn_num > payload.mobile_jkn_den) exceeds.push('Antrian Mobile JKN');

        if (exceeds.length > 0) {
          if (!confirm(`Peringatan: Nilai Numerator melebihi Denominator pada indikator berikut:\n- ${exceeds.join('\n- ')}\n\nApakah Anda yakin ingin tetap menyimpannya?`)) {
            return;
          }
        }

        const res = await api.post('/mutu-rekam-medis', payload);
        if (res.success) {
          showToast('Data berhasil disimpan', 'success');
          closeModal();
          await loadData();
        } else {
          showToast(res.message || 'Gagal menyimpan data', 'error');
        }
      }
    }
  );

  setupFormListeners();
}

async function handleDeleteRecord(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.')) return;

  const res = await api.delete(`/mutu-rekam-medis/${id}`);
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
          <h1 class="page-title">Standar Minimal Mutu Rekam Medis</h1>
          <p class="page-subtitle">Pencatatan dan pemantauan indikator mutu pelayanan rekam medis rumah sakit</p>
        </div>
      </div>

      <div class="card" style="padding: 24px; margin-top: 24px; display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Ringkasan Capaian Periode Aktif</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-light);">Capaian 5 indikator mutu rekam medis bulan ini</p>
          </div>
          <button class="btn btn-primary" id="btn-input-monthly">+ Input / Edit Data Bulan Ini</button>
        </div>

        <div id="summary-grid-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <!-- Summary cards rendered by JS -->
          <div style="grid-column: 1 / -1; color: var(--color-muted); text-align: center;">Memuat ringkasan...</div>
        </div>
      </div>

      <div class="card" style="padding: 24px; margin-top: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Riwayat Pencatatan Bulanan</h3>
        
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Bulan / Periode</th>
                <th style="text-align: center;">Kelengkapan Ranap</th>
                <th style="text-align: center;">Pengembalian RM 24 Jam</th>
                <th style="text-align: center;">Antrian Online</th>
                <th style="text-align: center;">Ketepatan Coding</th>
                <th style="text-align: center;">Antrian Mobile JKN</th>
                <th style="text-align: center; width: 100px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="history-table-body">
              <tr><td colspan="7" style="text-align: center; color: var(--color-muted);">Memuat riwayat pencatatan...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-input-monthly').addEventListener('click', () => openInputModal());

  await loadData();

  window.addEventListener('periodeChanged', handleFilterChange);
};

export const destroy = () => {
  window.removeEventListener('periodeChanged', handleFilterChange);
};
