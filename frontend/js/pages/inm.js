import { api } from '../api/client.js';

if (window.Chart && window.ChartDataLabels) {
  Chart.register(window.ChartDataLabels);
}

let currentTahun = new Date().getFullYear();
let currentBulanAwal = 1;
let currentBulanAkhir = new Date().getMonth() + 1;
let currentUnitId = 'all';
let chartInstances = [];

const BULAN_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function parseStandar(standar) {
  const m = String(standar || '').match(/[\d.,]+/);
  return m ? parseFloat(m[0].replace(',', '.')) : 100;
}

export function destroy() {
  chartInstances.forEach(c => { try { c.destroy(); } catch (e) {} });
  chartInstances = [];
}

export async function render(container) {
  container.innerHTML = `
    <div class="card" style="padding: 16px 20px; margin-bottom: 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.1rem;">📊 INM Chart — Indikator Nasional Mutu</h2>
        <div style="display:flex; gap:8px;">
          <button id="inm-btn-pdf" class="btn" style="background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;">📄 Unduh PDF</button>
          <button id="inm-btn-ppt" class="btn" style="background:#ea580c;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;">📊 Unduh PPT</button>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <label>Tahun:
          <select id="inm-tahun" class="form-control" style="display:inline-block; width:90px; padding:4px 8px;">
            ${[2024,2025,2026,2027].map(y => `<option value="${y}" ${y===currentTahun?'selected':''}>${y}</option>`).join('')}
          </select>
        </label>
        <label>Bulan Awal:
          <select id="inm-bulan-awal" class="form-control" style="display:inline-block; width:110px; padding:4px 8px;">
            ${BULAN_NAMES.map((b,i)=>`<option value="${i+1}" ${i+1===currentBulanAwal?'selected':''}>${b}</option>`).join('')}
          </select>
        </label>
        <label>Bulan Akhir:
          <select id="inm-bulan-akhir" class="form-control" style="display:inline-block; width:110px; padding:4px 8px;">
            ${BULAN_NAMES.map((b,i)=>`<option value="${i+1}" ${i+1===currentBulanAkhir?'selected':''}>${b}</option>`).join('')}
          </select>
        </label>
        <label>Unit:
          <select id="inm-unit" class="form-control" style="display:inline-block; width:160px; padding:4px 8px;">
            <option value="all">-- Semua Unit --</option>
          </select>
        </label>
      </div>
    </div>

    <div id="inm-pdf-area">
      <div id="inm-summary-table" style="margin-bottom:24px; overflow-x:auto;"></div>
      <div id="inm-charts"></div>
    </div>
  `;

  const tahunSel = document.getElementById('inm-tahun');
  const bAwalSel = document.getElementById('inm-bulan-awal');
  const bAkhirSel = document.getElementById('inm-bulan-akhir');
  const unitSel = document.getElementById('inm-unit');

  tahunSel.addEventListener('change', e => { currentTahun = parseInt(e.target.value); load(); });
  bAwalSel.addEventListener('change', e => { currentBulanAwal = parseInt(e.target.value); load(); });
  bAkhirSel.addEventListener('change', e => { currentBulanAkhir = parseInt(e.target.value); load(); });
  unitSel.addEventListener('change', e => { currentUnitId = e.target.value; load(); });

  document.getElementById('inm-btn-pdf').addEventListener('click', exportPDF);
  document.getElementById('inm-btn-ppt').addEventListener('click', exportPPT);

  async function load() {
    const summaryEl = document.getElementById('inm-summary-table');
    const chartsEl = document.getElementById('inm-charts');
    summaryEl.innerHTML = '<div style="padding:20px; text-align:center; color:#64748b;">Memuat data INM...</div>';
    chartsEl.innerHTML = '';
    destroy();
    try {
      const q = `kategori=inm&tahun=${currentTahun}&bulanAwal=${currentBulanAwal}&bulanAkhir=${currentBulanAkhir}&unitId=${currentUnitId}`;
      const res = await api.get(`/rekap-mutu?${q}`);
      if (!res.success || !res.data) throw new Error('Data kosong');
      const data = res.data;

      if (unitSel && data.allCategoryUnits) {
        let opts = '<option value="all">-- Semua Unit --</option>';
        data.allCategoryUnits.forEach(u => {
          opts += `<option value="${u.id}" ${String(u.id)===String(currentUnitId)?'selected':''}>${u.nama_unit}</option>`;
        });
        unitSel.innerHTML = opts;
      }

      renderSummaryTable(summaryEl, data);
      renderCharts(chartsEl, data);
    } catch (err) {
      summaryEl.innerHTML = `<div style="padding:20px;text-align:center;color:#9b1c1c;">⚠️ Gagal memuat data: ${err.message}</div>`;
    }
  }

  await load();
}

function renderSummaryTable(el, data) {
  const rows = (data.totalRs || []).map((ind, i) => {
    const tot = ind.totalPeriode || { numerator: 0, denominator: 0, capaian: 0 };
    const cap = typeof tot.capaian === 'number' ? tot.capaian : 0;
    const standar = parseStandar(ind.standar);
    const ok = cap >= standar;
    return `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="text-align:center; border:1px solid #cbd5e1; padding:6px;">${i + 1}</td>
      <td style="border:1px solid #cbd5e1; padding:6px;">${ind.nama_modul || ind.nama}</td>
      <td style="text-align:center; border:1px solid #cbd5e1; padding:6px;">${ind.standar}</td>
      <td style="text-align:center; border:1px solid #cbd5e1; padding:6px;">${tot.numerator}</td>
      <td style="text-align:center; border:1px solid #cbd5e1; padding:6px;">${tot.denominator}</td>
      <td style="text-align:center; border:1px solid #cbd5e1; padding:6px; font-weight:700; color:${ok ? '#059669' : '#dc2626'};">${cap}%</td>
    </tr>`;
  }).join('');
  el.innerHTML = `
    <table class="table" style="width:100%; border-collapse:collapse; font-size:0.82rem;">
      <table style="width:100%; border-collapse:collapse; font-size:0.82rem; border:1px solid #cbd5e1;">
      <thead>
        <tr style="background:#0f172a; color:#fff;">
          <th style="padding:8px; border:1px solid #334155;">No</th>
          <th style="padding:8px; text-align:left; border:1px solid #334155;">Indikator Mutu (INM)</th>
          <th style="padding:8px; border:1px solid #334155;">Standar</th>
          <th style="padding:8px; border:1px solid #334155;">N</th>
          <th style="padding:8px; border:1px solid #334155;">D</th>
          <th style="padding:8px; border:1px solid #334155;">Capaian</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderCharts(el, data) {
  const items = data.totalRs || [];
  if (!items.length) { el.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">Tidak ada data INM.</div>'; return; }

  const months = (data.bulanList || []).map(b => b.bulan);
  const tahunLabel = data.tahun || currentTahun;

  el.innerHTML = items.map((ind, idx) => `
    <div class="card" style="margin-bottom:28px; padding:20px; border:1px solid #e2e8f0; border-radius:8px; page-break-inside:avoid;">
      <h3 style="text-align:center; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin:0 0 12px 0;">${ind.nama_modul || ind.nama}</h3>
      <div style="position:relative; height:320px; color:#000;">
        <canvas id="inm-chart-${idx}"></canvas>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-top:14px; font-size:0.8rem;">
        <thead>
          <tr>
            <th style="border:1px solid #cbd5e1; padding:4px; width:140px;"></th>
            ${months.map(m => `<th style="border:1px solid #cbd5e1; padding:4px;">${BULAN_NAMES[m-1]}<br>${tahunLabel}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:4px; color:#1d4ed8; font-weight:600;">PENCAPAIAN</td>
            ${months.map(m => {
              const c = (ind.monthlyData && ind.monthlyData[m] && typeof ind.monthlyData[m].capaian === 'number') ? ind.monthlyData[m].capaian : 0;
              return `<td style="border:1px solid #cbd5e1; padding:4px; text-align:center;">${c}%</td>`;
            }).join('')}
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:4px; color:#dc2626; font-weight:600;">STANDAR</td>
            ${months.map(() => `<td style="border:1px solid #cbd5e1; padding:4px; text-align:center;">${String(parseStandar(ind.standar))}%</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `).join('');

  items.forEach((ind, idx) => {
    const canvas = document.getElementById(`inm-chart-${idx}`);
    if (!canvas) return;
    const capaian = months.map(m => {
      const v = (ind.monthlyData && ind.monthlyData[m] && typeof ind.monthlyData[m].capaian === 'number') ? ind.monthlyData[m].capaian : null;
      return v;
    });
    const standarVal = parseStandar(ind.standar);
    const standar = months.map(() => standarVal);
    const allVals = [...capaian.filter(v => v !== null), standarVal];
    const rawMax = Math.max(...allVals, 100);
    const maxVal = rawMax > 100 ? Math.ceil(rawMax) : 100; // pas di 100% bila semua data ≤ 100
    const minVal = 0;

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: months.map(m => `${BULAN_NAMES[m-1]} ${tahunLabel}`),
        datasets: [
          {
            label: 'PENCAPAIAN',
            data: capaian,
            borderColor: '#1d4ed8',
            backgroundColor: '#1d4ed8',
            pointStyle: 'diamond',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            tension: 0,
            datalabels: {
              align: 'end',
              anchor: 'end',
              offset: 4,
              clamp: true,
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderColor: '#cbd5e1',
              borderWidth: 1,
              borderRadius: 3,
              padding: { top: 2, bottom: 2, left: 4, right: 4 },
              font: { weight: 'bold', size: 10 },
              color: '#1e293b',
              formatter: v => (v === null || v === undefined) ? '' : `${v}%`
            }
          },
          {
            label: 'STANDAR',
            data: standar,
            borderColor: '#dc2626',
            backgroundColor: '#dc2626',
            pointStyle: 'rect',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0,
            datalabels: { display: false }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: Math.floor(minVal),
            max: Math.ceil(maxVal),
            ticks: { callback: v => `${v}%`, stepSize: 20 },
            title: { display: true, text: 'Besar Persentase', font: { weight: 'bold' } },
            grid: { color: '#e2e8f0' }
          },
          x: {
            grid: { display: false },
            ticks: { autoSkip: false, maxRotation: 45, minRotation: 0, font: { size: 10 }, padding: 4 }
          }
        },
        layout: { padding: { top: 18, right: 10 } },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 12, padding: 16 } },
          datalabels: { display: true }
        }
      }
    });
    chartInstances.push(chart);
  });
}

function exportPPT() {
  if (typeof PptxGenJS === 'undefined') {
    alert('Library PPT belum siap, coba muat ulang halaman.');
    return;
  }
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  pptx.title = 'INDIKATOR NASIONAL MUTU (INM)';

  const items = [];
  document.querySelectorAll('#inm-charts .card').forEach((card, idx) => {
    const canvas = card.querySelector('canvas');
    const title = card.querySelector('h3')?.innerText || `INM ${idx + 1}`;
    if (canvas) items.push({ canvas, title });
  });

  if (!items.length) { alert('Belum ada chart. Muat data terlebih dahulu.'); return; }

  // Slide judul
  const s0 = pptx.addSlide();
  s0.background = { color: '0f172a' };
  s0.addText('INDIKATOR NASIONAL MUTU (INM)', { x: 0.5, y: 2.6, w: 12.3, h: 1, fontSize: 36, bold: true, color: 'FFFFFF', align: 'center' });
  s0.addText(`Periode: ${currentBulanAwal} - ${currentBulanAkhir} / ${currentTahun}`, { x: 0.5, y: 3.7, w: 12.3, h: 0.6, fontSize: 18, color: 'cbd5e1', align: 'center' });
  s0.addText(`Unit: ${currentUnitId === 'all' ? 'Semua Unit' : (document.getElementById('inm-unit')?.selectedOptions?.[0]?.text || '')}`, { x: 0.5, y: 4.3, w: 12.3, h: 0.6, fontSize: 14, color: '94a3b8', align: 'center' });

  // Ambil data totalRs untuk keterangan
  const dataCharts = document.querySelectorAll('#inm-charts .card');
  items.forEach((it, idx) => {
    const canvas = it.canvas;
    let img = '';
    try { img = canvas.toDataURL('image/png', 1); } catch (e) { console.warn('canvas tainted', e); }

    const slide = pptx.addSlide();
    slide.addText(it.title, { x: 0.4, y: 0.25, w: 12.5, h: 0.6, fontSize: 20, bold: true, color: '0f172a', align: 'center' });
    if (img) slide.addImage({ data: img, x: 0.4, y: 1.0, w: 9.2, h: 5.6 });

    // Keterangan tiap chart
    slide.addText(
      `Keterangan:\n` +
      `• Indikator: ${it.title}\n` +
      `• Chart menampilkan capaian mutu (%) per bulan dibandingkan standar nasional (%) selama periode berjalan.\n` +
      `• Garis merah menunjukkan batas standar INM; titik biru menunjukkan pencapaian riil.\n` +
      `• Indikator memenuhi syarat apabila capaian ≥ standar pada periode tersebut.`,
      { x: 9.8, y: 1.0, w: 3.2, h: 4.6, fontSize: 11, color: '334155', valign: 'top', align: 'left', fill: { color: 'f8fafc' } }
    );
  });

  pptx.writeFile({ fileName: `INM_Chart_${currentTahun}_Bulan_${currentBulanAwal}-${currentBulanAkhir}.pptx` });
}

function exportPDF() {
  const area = document.getElementById('inm-pdf-area');
  if (!area || typeof html2pdf === 'undefined') {
    alert('Fitur PDF belum siap, coba muat ulang halaman.');
    return;
  }
  html2pdf().set({
    margin: 8,
    filename: `INM_Chart_${currentTahun}_Bulan_${currentBulanAwal}-${currentBulanAkhir}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 1.5, useCORS: true, windowWidth: 1600 },
    jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' },
    pagebreak: { mode: ['css', 'legacy'], avoid: '.card' }
  }).from(area).save();
}
