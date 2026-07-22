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

function formatPeriod(pInput) {
  if (!pInput) return '-';
  if (typeof pInput === 'object') {
    if (pInput.periode && pInput.periode.bulan && pInput.periode.tahun) {
      return `${monthNames[pInput.periode.bulan]} ${pInput.periode.tahun}`;
    }
    if (pInput.bulan && pInput.tahun) {
      return `${monthNames[pInput.bulan]} ${pInput.tahun}`;
    }
    pInput = pInput.periode_id || pInput.id;
  }
  const pid = Number(pInput);
  const p = Store.periodeList?.find(x => Number(x.id) === pid);
  if (p && p.bulan && p.tahun) {
    return `${monthNames[p.bulan]} ${p.tahun}`;
  }
  return `Periode ID: ${pid}`;
}

function sortRecordsByPeriod(recordsList) {
  return recordsList.sort((a, b) => {
    const paBulan = a.periode?.bulan || Store.periodeList?.find(x => Number(x.id) === Number(a.periode_id))?.bulan || 0;
    const paTahun = a.periode?.tahun || Store.periodeList?.find(x => Number(x.id) === Number(a.periode_id))?.tahun || 0;
    const pbBulan = b.periode?.bulan || Store.periodeList?.find(x => Number(x.id) === Number(b.periode_id))?.bulan || 0;
    const pbTahun = b.periode?.tahun || Store.periodeList?.find(x => Number(x.id) === Number(b.periode_id))?.tahun || 0;

    if (paTahun !== pbTahun) return pbTahun - paTahun;
    if (paBulan !== pbBulan) return pbBulan - paBulan;
    return Number(b.periode_id) - Number(a.periode_id);
  });
}

async function loadData() {
  if (!Store.periodeList || Store.periodeList.length === 0) {
    const pRes = await api.get('/periode');
    if (pRes.success) Store.periodeList = pRes.data;
  }

  const activePeriodId = Store.periodeAktif?.id;
  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : 'Belum Dipilih';
  
  const pageSubtitleEl = document.getElementById('page-subtitle-text');
  if (pageSubtitleEl) {
    pageSubtitleEl.innerHTML = `Pencatatan dan pemantauan indikator mutu pelayanan rekam medis rumah sakit <span class="badge badge-primary" style="margin-left: 6px; font-weight: 600; font-size: 0.8rem;">Periode: ${activePeriodName}</span>`;
  }

  const sectionSubtextEl = document.getElementById('summary-section-subtext');
  if (sectionSubtextEl) {
    sectionSubtextEl.textContent = `Capaian 5 indikator mutu rekam medis bulan ${activePeriodName}`;
  }

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

  state.activePeriodRecord = state.records.find(r => Number(r.periode_id) === Number(activePeriodId)) || null;

  renderSummaryGrid();
  renderTableBody();
}

function renderSummaryGrid() {
  const container = document.getElementById('summary-grid-container');
  if (!container) return;

  const activePeriodName = Store.periodeAktif ? `${monthNames[Store.periodeAktif.bulan]} ${Store.periodeAktif.tahun}` : '-';

  if (!state.activePeriodRecord) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: var(--bg-light, #f8fafc); border-left: 4px solid var(--color-warning, #eab308); padding: 12px 14px; border-radius: 4px; font-size: 0.85rem;">
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
      title: 'Pengembalian RM 24 Jm',
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
    const badgeText = isTargetAchieved ? '✓ Tercapai' : '✕ Belum';

    return `
      <div class="card" style="padding: 10px 12px; border: 1px solid var(--border-color, #e2e8f0); display: flex; flex-direction: column; gap: 4px; background: var(--bg-light, #f8fafc); border-radius: 6px;">
        <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary, #1e293b); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${ind.title}">
          ${ind.title}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
          <span style="font-size: 1.15rem; font-weight: 700; color: ${isTargetAchieved ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">
            ${ind.pct.toFixed(2)}%
          </span>
          <span class="badge ${badgeClass}" style="font-size: 0.7rem; padding: 2px 6px;">${badgeText}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted, #64748b); display: flex; justify-content: space-between;">
          <span>Target: <strong>≥${ind.target}%</strong></span>
          <span>(N: <strong>${ind.num}</strong> / D: <strong>${ind.den}</strong>)</span>
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
        <td colspan="7" style="text-align: center; color: var(--color-muted); padding: 12px;">Belum ada data historis.</td>
      </tr>
    `;
    return;
  }

  const sorted = sortRecordsByPeriod([...state.records]);
  const canDelete = Store.canDelete();

  container.innerHTML = sorted.map(r => {
    return `
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; white-space: nowrap;">${formatPeriod(r)}</td>
        <td style="text-align: center; padding: 8px 8px; font-size: 0.85rem;">
          <span style="font-weight: 700; color: ${r.kelengkapan_ranap_pct >= 100 ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">${r.kelengkapan_ranap_pct.toFixed(2)}%</span>
          <div style="font-size: 0.72rem; color: var(--text-muted, #64748b);">(${r.kelengkapan_ranap_num}/${r.kelengkapan_ranap_den})</div>
        </td>
        <td style="text-align: center; padding: 8px 8px; font-size: 0.85rem;">
          <span style="font-weight: 700; color: ${r.pengembalian_pct >= 100 ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">${r.pengembalian_pct.toFixed(2)}%</span>
          <div style="font-size: 0.72rem; color: var(--text-muted, #64748b);">(${r.pengembalian_num}/${r.pengembalian_den})</div>
        </td>
        <td style="text-align: center; padding: 8px 8px; font-size: 0.85rem;">
          <span style="font-weight: 700; color: ${r.antrian_online_pct >= 85 ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">${r.antrian_online_pct.toFixed(2)}%</span>
          <div style="font-size: 0.72rem; color: var(--text-muted, #64748b);">(${r.antrian_online_num}/${r.antrian_online_den})</div>
        </td>
        <td style="text-align: center; padding: 8px 8px; font-size: 0.85rem;">
          <span style="font-weight: 700; color: ${r.coding_pct >= 100 ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">${r.coding_pct.toFixed(2)}%</span>
          <div style="font-size: 0.72rem; color: var(--text-muted, #64748b);">(${r.coding_num}/${r.coding_den})</div>
        </td>
        <td style="text-align: center; padding: 8px 8px; font-size: 0.85rem;">
          <span style="font-weight: 700; color: ${r.mobile_jkn_pct >= 30 ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)'};">${r.mobile_jkn_pct.toFixed(2)}%</span>
          <div style="font-size: 0.72rem; color: var(--text-muted, #64748b);">(${r.mobile_jkn_num}/${r.mobile_jkn_den})</div>
        </td>
        <td style="text-align: center; padding: 8px 8px; white-space: nowrap;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-outline btn-sm btn-edit-record" data-id="${r.id}" style="padding: 2px 8px; font-size: 0.78rem;">Edit</button>
            ${canDelete ? `<button class="btn btn-danger btn-sm btn-delete-record" data-id="${r.id}" style="padding: 2px 8px; font-size: 0.78rem;">Hapus</button>` : ''}
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
    <form id="rekam-medis-form" style="display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; padding-right: 8px;">
      <div class="form-group" style="margin-bottom: 4px;">
        <label class="form-label" style="font-weight: bold; font-size: 0.85rem;">Bulan / Periode Pelaporan</label>
        <input type="text" class="form-control" value="${record ? formatPeriod(record) : activePeriodName}" disabled style="font-size: 0.85rem;">
      </div>

      <!-- 1. Kelengkapan RM Ranap -->
      <div style="background: var(--bg-light); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          1. Kelengkapan Dokumen Rekam Medis Pasien Ranap
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 70px; gap: 8px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Numerator (Lengkap) <span class="required">*</span></label>
            <input type="number" name="kelengkapan_ranap_num" class="form-control" value="${data.kelengkapan_ranap_num}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Denumerator (Total RM) <span class="required">*</span></label>
            <input type="number" name="kelengkapan_ranap_den" class="form-control" value="${data.kelengkapan_ranap_den}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.68rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="kelengkapan-ranap-pct-preview" style="font-weight: 700; font-size: 0.9rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 2. Pengembalian & Pengisian 1x24 Jam -->
      <div style="background: var(--bg-light); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          2. Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 70px; gap: 8px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Numerator (Tepat) <span class="required">*</span></label>
            <input type="number" name="pengembalian_num" class="form-control" value="${data.pengembalian_num}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Denumerator (Total RM) <span class="required">*</span></label>
            <input type="number" name="pengembalian_den" class="form-control" value="${data.pengembalian_den}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.68rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="pengembalian-pct-preview" style="font-weight: 700; font-size: 0.9rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 3. Pemberian Informasi Antrian Online -->
      <div style="background: var(--bg-light); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          3. Pemberian Informasi Antrian Online <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light);">(Target: ≥ 85%)</span>
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 70px; gap: 8px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Numerator (Diinfo) <span class="required">*</span></label>
            <input type="number" name="antrian_online_num" class="form-control" value="${data.antrian_online_num}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Denumerator (Total Antrian) <span class="required">*</span></label>
            <input type="number" name="antrian_online_den" class="form-control" value="${data.antrian_online_den}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.68rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="antrian-online-pct-preview" style="font-weight: 700; font-size: 0.9rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 4. Ketepatan Coding -->
      <div style="background: var(--bg-light); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
        <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          4. Ketepatan Coding Rawat Inap & Rawat Jalan
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 70px; gap: 8px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Numerator (Tepat) <span class="required">*</span></label>
            <input type="number" name="coding_num" class="form-control" value="${data.coding_num}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Denumerator (Total Berkas) <span class="required">*</span></label>
            <input type="number" name="coding_den" class="form-control" value="${data.coding_den}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.68rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="coding-pct-preview" style="font-weight: 700; font-size: 0.9rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>

      <!-- 5. Antrian Mobile JKN -->
      <div style="background: var(--bg-light); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 6px;">
        <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          5. Antrian Mobile JKN <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-light);">(Target: ≥ 30%)</span>
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 70px; gap: 8px; align-items: center;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Numerator (Mobile JKN) <span class="required">*</span></label>
            <input type="number" name="mobile_jkn_num" class="form-control" value="${data.mobile_jkn_num}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Denumerator (Total Antrian) <span class="required">*</span></label>
            <input type="number" name="mobile_jkn_den" class="form-control" value="${data.mobile_jkn_den}" min="0" required style="font-size: 0.85rem; padding: 4px 8px;">
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.68rem; color: var(--text-light); margin-bottom: 2px;">Hasil</div>
            <div id="mobile-jkn-pct-preview" style="font-weight: 700; font-size: 0.9rem; color: var(--text-light);">0.00%</div>
          </div>
        </div>
      </div>
    </form>
  `;

  showModal(
    isEdit ? 'Edit Mutu Rekam Medis' : 'Input Mutu Rekam Medis',
    modalHTML,
    {
      width: '560px',
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
          <p class="page-subtitle" id="page-subtitle-text">Pencatatan dan pemantauan indikator mutu pelayanan rekam medis rumah sakit</p>
        </div>
      </div>

      <div class="card" style="padding: 16px; margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">Ringkasan Capaian Periode Aktif</h3>
            <p id="summary-section-subtext" style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-light);">Capaian 5 indikator mutu rekam medis bulan ini</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-input-monthly" style="padding: 6px 14px; font-size: 0.85rem;">+ Input / Edit Data Bulan Ini</button>
        </div>

        <div id="summary-grid-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px;">
          <!-- Summary cards rendered by JS -->
          <div style="grid-column: 1 / -1; color: var(--color-muted); text-align: center; font-size: 0.85rem;">Memuat ringkasan...</div>
        </div>
      </div>

      <div class="card" style="padding: 16px; margin-top: 16px;">
        <h3 style="margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">Riwayat Pencatatan Bulanan</h3>
        
        <div class="table-wrapper" style="overflow-x: auto; font-size: 0.85rem;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 8px 12px;">Periode</th>
                <th style="text-align: center; padding: 8px 8px;">Kelengkapan Ranap</th>
                <th style="text-align: center; padding: 8px 8px;">Pengembalian 24 Jm</th>
                <th style="text-align: center; padding: 8px 8px;">Antrian Online</th>
                <th style="text-align: center; padding: 8px 8px;">Ketepatan Coding</th>
                <th style="text-align: center; padding: 8px 8px;">Mobile JKN</th>
                <th style="text-align: center; width: 90px; padding: 8px 8px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="history-table-body">
              <tr><td colspan="7" style="text-align: center; color: var(--color-muted); padding: 12px;">Memuat riwayat pencatatan...</td></tr>
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
