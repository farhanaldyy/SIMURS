const prisma = require('../config/database');
const ExcelJS = require('exceljs');

// Configuration for Rawat Inap Indicators matching modul-rekap-mutu-rwi.ods & user specifications
const RAWAT_INAP_INDICATORS = [
  {
    no: 1,
    id: 'reaksi_transfusi',
    nama: 'Angka kejadian reaksi transfusi ( ≤ 0,01% ) - Nama Modul: Reaksi Transfusi',
    nama_modul: 'Angka Kejadian Reaksi Transfusi',
    standar: '≤ 0.01%',
    label_numerator: 'Total Data (Ada Reaksi)',
    label_denominator: 'Total Data (Pasien)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/reaksi-transfusi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 2,
    id: 'identifikasi_pasien',
    nama: 'Kepatuhan identifikasi pasien ( 100% ) - Nama Modul: Identifikasi Pasien',
    nama_modul: 'Kepatuhan Identifikasi Pasien',
    standar: '100%',
    label_numerator: 'Total Data (Di Lakukan)',
    label_denominator: 'Total Data (Dilakukan + Tidak Dilakukan)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/identifikasi-pasien.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 3,
    id: 'risiko_jatuh',
    nama: 'Kepatuhan upaya pencegahan risiko pasien jatuh ( 100% ) - Nama Modul: Risiko Jatuh',
    nama_modul: 'Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh',
    standar: '100%',
    label_numerator: 'Total Data (Di Lakukan)',
    label_denominator: 'Total Data (Dilakukan + Tidak Dilakukan)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/risiko-jatuh.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 4,
    id: 'visit_dokter',
    nama: 'Kepatuhan visite dokter ( ≥ 80% ) - Nama Modul: Visit Dokter Spesialis',
    nama_modul: 'Kepatuhan Visit Dokter Spesialis',
    standar: '≥ 80%',
    label_numerator: 'Total Data (Patuh N1 + N2)',
    label_denominator: 'Total Data (Pasien)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/visit-dokter.service'),
    extract: (summary) => {
      const num = (summary.numerator || 0) + (summary.numerator2 || 0);
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 5,
    id: 'alur_klinis',
    nama: 'Kepatuhan terhadap alur klinis (Clinical Pathway) ( ≥ 80% ) - Nama Modul: Alur Klinis',
    nama_modul: 'Kepatuhan Terhadap Alur Klinis (Clinical Pathway)',
    standar: '≥ 80%',
    label_numerator: 'Total Data (Sesuai)',
    label_denominator: 'Total Data (Sesuai + Tidak Sesuai)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/alur-klinis.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 6,
    id: 'double_check_high_alert',
    nama: 'Kepatuhan pelaksanan doubel chek pada obat high alert ( ≥ 80% ) - Nama Modul: Double Check High Alert',
    nama_modul: 'Kepatuhan Pelaksanaan Double Chek Pada Obat High Alert',
    standar: '≥ 80%',
    label_numerator: 'Total Data (Patuh Double Check “N”)',
    label_denominator: 'Total Data (Total Pasien High Alert “D”)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/double-check-high-alert.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 7,
    id: 'kepatuhan_kebersihan_tangan',
    nama: 'Kepatuhan kebersihan tangan ( ≥ 85% ) - Nama Modul: Kepatuhan Kebersihan Tangan',
    nama_modul: 'Kepatuhan Kebersihan Tangan',
    standar: '≥ 85%',
    label_numerator: 'Total Data (Momen Sesuai “N”)',
    label_denominator: 'Total Data (Momen Tidak Sesuai “D”)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kepatuhan-kebersihan-tangan.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 8,
    id: 'kepatuhan_apd',
    nama: 'Kepatuhan penggunaan APD ( 100% ) - Nama Modul: Kepatuhan Penggunaan APD',
    nama_modul: 'Kepatuhan Penggunaan APD',
    standar: '100%',
    label_numerator: 'Total Data (APD Dipakai “N”)',
    label_denominator: 'Total Data (APD Wajib Indikasi “D”)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kepatuhan-apd.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 9,
    id: 'insiden_keselamatan',
    nama: 'Insiden Keselamatan Pasien',
    nama_modul: 'Insiden Keselamatan Pasien',
    standar: '0%',
    label_numerator: 'Total Data (Insiden Keselamatan)',
    label_denominator: 'Total Data (Populasi pasien)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/insiden-keselamatan.service'),
    extract: (summary) => {
      const num = summary.total !== undefined ? summary.total : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 10,
    id: 'angka_kematian_ranap',
    nama: 'Kejadian pasien meninggal di Rawat Inap ( - ) - Nama Modul: Angka Kematian Ranap',
    nama_modul: 'Kejadian Pasien Meninggal di Rawat Inap',
    standar: '0%',
    label_numerator: 'Total Data (Kematian Pasien)',
    label_denominator: 'Total Data (Populasi pasien)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/angka-kematian-ranap.service'),
    extraWhere: { lokasi: 'ranap' },
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
];

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Excel Monthly Color Palette (8-character ARGB Hex string)
const EXCEL_MONTH_PALETTES = [
  { headerBg: 'FFDBEAFE', subBg: 'FFEFF6FF', capBg: 'FFBFDBFE' }, // Jan - Soft Blue
  { headerBg: 'FFD1FAE5', subBg: 'FFECFDF5', capBg: 'FFA7F3D0' }, // Feb - Soft Emerald
  { headerBg: 'FFFEF3C7', subBg: 'FFFDF8E1', capBg: 'FFFDE68A' }, // Mar - Soft Amber
  { headerBg: 'FFE9D5FF', subBg: 'FFFAF5FF', capBg: 'FFD8B4FE' }, // Apr - Soft Purple
  { headerBg: 'FFFECDD3', subBg: 'FFFF1F2', capBg: 'FFFDA4AF' }, // May - Soft Rose
  { headerBg: 'FFCFF4FC', subBg: 'FFF0FDFA', capBg: 'FFA5F3FC' }, // Jun - Soft Cyan
  { headerBg: 'FFFFEDD5', subBg: 'FFFF7ED', capBg: 'FFFED7AA' }, // Jul - Soft Orange
  { headerBg: 'FFE2E8F0', subBg: 'FFF8FAFC', capBg: 'FFCBD5E1' }, // Aug - Soft Slate
  { headerBg: 'FFD9F99D', subBg: 'FFF7FEE7', capBg: 'FFBEF264' }, // Sep - Soft Lime
  { headerBg: 'FFFBCFE8', subBg: 'FFFDF2F8', capBg: 'FFF472B6' }, // Oct - Soft Pink
  { headerBg: 'FFCCFBF1', subBg: 'FFF0FDFA', capBg: 'FF99F6E4' }, // Nov - Soft Teal
  { headerBg: 'FFE0E7FF', subBg: 'FFEEF2FF', capBg: 'FFC7D2FE' }, // Dec - Soft Indigo
];

function getExcelMonthPalette(monthNum) {
  const idx = (monthNum - 1) % EXCEL_MONTH_PALETTES.length;
  return EXCEL_MONTH_PALETTES[idx];
}

/**
 * Calculate float capaian percentage: Numerator / Denumerator * 100
 */
function calculateCapaian(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0;
  const floatVal = (numerator / denominator) * 100;
  return parseFloat(floatVal.toFixed(2));
}

/**
 * Get matrix data for Rekap Data Mutu per Unit
 */
async function getRekapMutuData({ kategori = 'rawat_inap', tahun = 2026, bulanAwal = 1, bulanAkhir = 3 }) {
  const selectedTahun = parseInt(tahun) || new Date().getFullYear();
  const startBulan = Math.max(1, Math.min(12, parseInt(bulanAwal) || 1));
  const endBulan = Math.max(startBulan, Math.min(12, parseInt(bulanAkhir) || 3));

  // Build month list
  const bulanList = [];
  for (let b = startBulan; b <= endBulan; b++) {
    bulanList.push({ bulan: b, nama: NAMA_BULAN[b - 1] });
  }

  // Determine indicators and units based on category
  let indicatorConfigs = [];
  let unitWhere = {};

  if (kategori === 'rawat_inap' || kategori === 'ranap') {
    indicatorConfigs = RAWAT_INAP_INDICATORS;
    unitWhere = {
      OR: [
        { kode_unit: { startsWith: 'RI_' } },
        { nama_unit: { in: ['JABAL NUR', 'JABAL RAHMAH', 'ASSYIFA', 'SHAFA', 'HADIMUALIM & SINTAS', 'SINGAPERBANGSA'] } }
      ],
      aktif: true,
    };
  } else {
    indicatorConfigs = RAWAT_INAP_INDICATORS;
    unitWhere = { aktif: true };
  }

  // Fetch units from DB
  const rooms = await prisma.unit.findMany({
    where: unitWhere,
    orderBy: { id: 'asc' }
  });

  // Fetch all period records for the given year and month range
  const periodes = await prisma.periode.findMany({
    where: {
      tahun: selectedTahun,
      bulan: { gte: startBulan, lte: endBulan }
    }
  });

  const periodeMap = {};
  periodes.forEach(p => {
    periodeMap[p.bulan] = p.id;
  });

  // Process room data concurrently
  const roomResults = await Promise.all(
    rooms.map(async (room) => {
      const indicators = await Promise.all(
        indicatorConfigs.map(async (ind) => {
          const monthlyData = {};

          for (const bObj of bulanList) {
            const b = bObj.bulan;
            const pid = periodeMap[b];

            if (!pid) {
              monthlyData[b] = { numerator: 0, denominator: 0, capaian: 0 };
              continue;
            }

            try {
              const queryWhere = { periode_id: pid, unit_id: room.id, ...(ind.extraWhere || {}) };
              const summary = await ind.service.getSummary(queryWhere);
              const { num, den } = ind.extract(summary);
              const capaian = calculateCapaian(num, den);

              monthlyData[b] = {
                numerator: num,
                denominator: den,
                capaian
              };
            } catch (err) {
              console.error(`Error calculating summary for room ${room.nama_unit}, ind ${ind.id}, month ${b}:`, err.message);
              monthlyData[b] = { numerator: 0, denominator: 0, capaian: 0 };
            }
          }

          return {
            no: ind.no,
            id: ind.id,
            nama: ind.nama,
            nama_modul: ind.nama_modul,
            standar: ind.standar,
            label_numerator: ind.label_numerator,
            label_denominator: ind.label_denominator,
            formula: ind.formula,
            monthlyData
          };
        })
      );

      return {
        id: room.id,
        nama_unit: room.nama_unit,
        kode_unit: room.kode_unit,
        indicators
      };
    })
  );

  // Calculate Total MUTU RS (Aggregated across all rooms)
  const totalRs = indicatorConfigs.map(ind => {
    const monthlyData = {};

    for (const bObj of bulanList) {
      const b = bObj.bulan;
      let totNum = 0;
      let totDen = 0;

      roomResults.forEach(r => {
        const indData = r.indicators.find(i => i.id === ind.id);
        if (indData && indData.monthlyData[b]) {
          totNum += indData.monthlyData[b].numerator || 0;
          totDen += indData.monthlyData[b].denominator || 0;
        }
      });

      const totCapaian = calculateCapaian(totNum, totDen);
      monthlyData[b] = {
        numerator: totNum,
        denominator: totDen,
        capaian: totCapaian
      };
    }

    return {
      no: ind.no,
      id: ind.id,
      nama: ind.nama,
      nama_modul: ind.nama_modul,
      standar: ind.standar,
      monthlyData
    };
  });

  return {
    kategori,
    tahun: selectedTahun,
    bulanAwal: startBulan,
    bulanAkhir: endBulan,
    bulanList,
    rooms: roomResults,
    totalRs
  };
}

/**
 * Generate Excel / ODS workbook for Rekap Data Mutu matching modul-rekap-mutu-rwi.ods layout & UI styling
 */
async function exportRekapMutuExcel({ kategori = 'rawat_inap', tahun = 2026, bulanAwal = 1, bulanAkhir = 3 }) {
  const data = await getRekapMutuData({ kategori, tahun, bulanAwal, bulanAkhir });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');

  // Title Row (Merged B2 to last month column)
  const totalCols = 3 + (data.bulanList.length * 3); // Col B(2), C(3), plus 3 cols per month starting at D(4)
  ws.mergeCells(2, 2, 2, totalCols);
  const titleCell = ws.getCell(2, 2);
  const katTitle = kategori === 'rawat_inap' || kategori === 'ranap' ? 'RAWAT INAP' : kategori.toUpperCase();
  titleCell.value = `REKAP CAPAIAN MUTU ${katTitle} RUMAH SAKIT ISLAM KARAWANG TAHUN ${data.tahun}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  let currentRow = 4;

  const applyHeaderStyles = (cell, bgHex = 'D9E1F2', fontColor = '000000') => {
    cell.font = { bold: true, color: { argb: fontColor } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  };

  const applyDataBorder = (cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  };

  // Render Table for Each Room
  for (const room of data.rooms) {
    // Room Header Row
    ws.mergeCells(currentRow, 2, currentRow, 3);
    const rUnitCell = ws.getCell(currentRow, 2);
    rUnitCell.value = `RUANGAN: ${room.nama_unit}`;
    rUnitCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    rUnitCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    rUnitCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyDataBorder(rUnitCell);
    applyDataBorder(ws.getCell(currentRow, 3));
    
    // Month Headers start at Column D (Col 4)
    let colIdx = 4;
    data.bulanList.forEach(b => {
      const endCol = colIdx + 2;
      const pal = getExcelMonthPalette(b.bulan);
      ws.mergeCells(currentRow, colIdx, currentRow, endCol);
      const bCell = ws.getCell(currentRow, colIdx);
      bCell.value = b.nama;
      applyHeaderStyles(bCell, pal.headerBg);
      colIdx += 3;
    });

    currentRow++;

    // Header No & Indikator Row + Sub-headers Row
    const rNo = ws.getCell(currentRow, 2);
    const rInd = ws.getCell(currentRow, 3);
    rNo.value = 'No';
    rInd.value = 'Indikator Mutu';
    applyHeaderStyles(rNo, 'FFD9D9D9');
    applyHeaderStyles(rInd, 'FFD9D9D9');

    // Sub-header Row (N, D, C) starting at Column D (Col 4)
    colIdx = 4;
    data.bulanList.forEach(b => {
      const pal = getExcelMonthPalette(b.bulan);
      const cNum = ws.getCell(currentRow, colIdx);
      const cDen = ws.getCell(currentRow, colIdx + 1);
      const cCap = ws.getCell(currentRow, colIdx + 2);

      cNum.value = 'N';
      cDen.value = 'D';
      cCap.value = 'C';

      applyHeaderStyles(cNum, pal.subBg);
      applyHeaderStyles(cDen, pal.subBg);
      applyHeaderStyles(cCap, pal.capBg);

      colIdx += 3;
    });

    currentRow++;

    // Indicator Data Rows
    for (const ind of room.indicators) {
      const row = ws.getRow(currentRow);
      row.getCell(2).value = ind.no;
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      applyDataBorder(row.getCell(2));

      row.getCell(3).value = `${ind.nama_modul} (Standar: ${ind.standar})`;
      row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      applyDataBorder(row.getCell(3));

      // Data values start at Column D (Col 4)
      colIdx = 4;
      data.bulanList.forEach(b => {
        const pal = getExcelMonthPalette(b.bulan);
        const d = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
        const cNum = ws.getCell(currentRow, colIdx);
        const cDen = ws.getCell(currentRow, colIdx + 1);
        const cCap = ws.getCell(currentRow, colIdx + 2);

        cNum.value = d.numerator;
        cDen.value = d.denominator;
        cCap.value = d.capaian; // Float number
        cCap.numFmt = '0.00';   // Excel decimal format

        // Centered alignment matching UI table
        cNum.alignment = { horizontal: 'center', vertical: 'middle' };
        cDen.alignment = { horizontal: 'center', vertical: 'middle' };
        cCap.alignment = { horizontal: 'center', vertical: 'middle' };

        cCap.font = { bold: true };
        cCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.capBg } };

        applyDataBorder(cNum);
        applyDataBorder(cDen);
        applyDataBorder(cCap);

        colIdx += 3;
      });

      currentRow++;
    }

    currentRow += 2;
  }

  // Render TOTAL MUTU RS Summary Table
  ws.mergeCells(currentRow, 2, currentRow, 3);
  const rRsHeaderCell = ws.getCell(currentRow, 2);
  rRsHeaderCell.value = 'TOTAL CAPAIAN MUTU RUMAH SAKIT';
  rRsHeaderCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  rRsHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
  rRsHeaderCell.alignment = { vertical: 'middle', horizontal: 'left' };
  applyDataBorder(rRsHeaderCell);
  applyDataBorder(ws.getCell(currentRow, 3));

  let colIdx = 4;
  data.bulanList.forEach(b => {
    const endCol = colIdx + 2;
    const pal = getExcelMonthPalette(b.bulan);
    ws.mergeCells(currentRow, colIdx, currentRow, endCol);
    const bCell = ws.getCell(currentRow, colIdx);
    bCell.value = `MUTU RS ${b.nama}`;
    applyHeaderStyles(bCell, pal.headerBg);
    colIdx += 3;
  });

  currentRow++;

  const rRsNo = ws.getCell(currentRow, 2);
  const rRsInd = ws.getCell(currentRow, 3);
  rRsNo.value = 'No';
  rRsInd.value = 'Indikator Mutu';
  applyHeaderStyles(rRsNo, 'FFD9D9D9');
  applyHeaderStyles(rRsInd, 'FFD9D9D9');

  colIdx = 4;
  data.bulanList.forEach(b => {
    const pal = getExcelMonthPalette(b.bulan);
    const cNum = ws.getCell(currentRow, colIdx);
    const cDen = ws.getCell(currentRow, colIdx + 1);
    const cCap = ws.getCell(currentRow, colIdx + 2);

    cNum.value = 'Tot N';
    cDen.value = 'Tot D';
    cCap.value = 'C';

    applyHeaderStyles(cNum, pal.subBg);
    applyHeaderStyles(cDen, pal.subBg);
    applyHeaderStyles(cCap, pal.capBg);

    colIdx += 3;
  });

  currentRow++;

  for (const ind of data.totalRs) {
    const row = ws.getRow(currentRow);
    row.getCell(2).value = ind.no;
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    applyDataBorder(row.getCell(2));

    row.getCell(3).value = `${ind.nama_modul} (Standar: ${ind.standar})`;
    row.getCell(3).font = { bold: true };
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    applyDataBorder(row.getCell(3));

    colIdx = 4;
    data.bulanList.forEach(b => {
      const pal = getExcelMonthPalette(b.bulan);
      const d = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
      const cNum = ws.getCell(currentRow, colIdx);
      const cDen = ws.getCell(currentRow, colIdx + 1);
      const cCap = ws.getCell(currentRow, colIdx + 2);

      cNum.value = d.numerator;
      cDen.value = d.denominator;
      cCap.value = d.capaian; // Float number
      cCap.numFmt = '0.00';

      cNum.font = { bold: true };
      cDen.font = { bold: true };
      cCap.font = { bold: true };

      cNum.alignment = { horizontal: 'center', vertical: 'middle' };
      cDen.alignment = { horizontal: 'center', vertical: 'middle' };
      cCap.alignment = { horizontal: 'center', vertical: 'middle' };

      cCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.capBg } };

      applyDataBorder(cNum);
      applyDataBorder(cDen);
      applyDataBorder(cCap);

      colIdx += 3;
    });

    currentRow++;
  }

  // Set column widths for optimal viewing
  ws.getColumn(1).width = 3;  // Col A padding
  ws.getColumn(2).width = 6;  // Col B: No
  ws.getColumn(3).width = 45; // Col C: Indikator Mutu

  for (let c = 4; c <= totalCols; c++) {
    ws.getColumn(c).width = 12; // Month data columns
  }

  return wb;
}

module.exports = {
  getRekapMutuData,
  exportRekapMutuExcel,
};
