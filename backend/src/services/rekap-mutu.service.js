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

// Excel Monthly Color Palette
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

function calculateCapaian(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0;
  const floatVal = (numerator / denominator) * 100;
  return parseFloat(floatVal.toFixed(2));
}

function getTriwulanLabel(startBulan, endBulan) {
  if (startBulan === 1 && endBulan === 3) return 'TOTAL TRIWULAN I';
  if (startBulan === 4 && endBulan === 6) return 'TOTAL TRIWULAN II';
  if (startBulan === 7 && endBulan === 9) return 'TOTAL TRIWULAN III';
  if (startBulan === 10 && endBulan === 12) return 'TOTAL TRIWULAN IV';
  if (startBulan === 1 && endBulan === 6) return 'TOTAL SEMESTER I';
  if (startBulan === 7 && endBulan === 12) return 'TOTAL SEMESTER II';
  return 'TOTAL PERIODE';
}

function getSemesterLabel(startBulan, endBulan) {
  if (startBulan === 1 && endBulan === 6) return 'TOTAL SEMESTER I';
  if (startBulan === 7 && endBulan === 12) return 'TOTAL SEMESTER II';
  return null;
}

/**
 * Get matrix data for Rekap Data Mutu per Unit
 */
async function getRekapMutuData({ kategori = 'rawat_inap', tahun = 2026, bulanAwal = 1, bulanAkhir = 3, unitId = 'all' }) {
  const selectedTahun = parseInt(tahun) || new Date().getFullYear();
  const startBulan = Math.max(1, Math.min(12, parseInt(bulanAwal) || 1));
  const endBulan = Math.max(startBulan, Math.min(12, parseInt(bulanAkhir) || 3));

  // Build month list
  const bulanList = [];
  for (let b = startBulan; b <= endBulan; b++) {
    bulanList.push({ bulan: b, nama: NAMA_BULAN[b - 1] });
  }

  const triwulanLabel = getTriwulanLabel(startBulan, endBulan);
  const semesterLabel = getSemesterLabel(startBulan, endBulan);
  const isSemesterMode = semesterLabel !== null;

  // Determine indicators and units based on category
  let indicatorConfigs = RAWAT_INAP_INDICATORS;
  let unitWhere = {
    kategori_unit: kategori,
    aktif: true,
  };

  // Fetch all active units for this category from DB
  const allCategoryUnits = await prisma.unit.findMany({
    where: unitWhere,
    orderBy: { id: 'asc' }
  });

  // Filter specific unit if requested
  let rooms = allCategoryUnits;
  if (unitId && unitId !== 'all') {
    const targetId = parseInt(unitId);
    rooms = allCategoryUnits.filter(u => u.id === targetId);
  }

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

  // Fetch active indicator configs for each room from UnitIndicatorConfig
  const allSavedConfigs = await prisma.unitIndicatorConfig.findMany({
    where: {
      unit_id: { in: rooms.map(r => r.id) }
    }
  });

  const roomConfigMap = {};
  allSavedConfigs.forEach(c => {
    if (!roomConfigMap[c.unit_id]) {
      roomConfigMap[c.unit_id] = { set: new Set(), hasSaved: true };
    }
    if (c.aktif) {
      roomConfigMap[c.unit_id].set.add(c.indicator_id);
    }
  });

  // Process room data concurrently
  const roomResults = await Promise.all(
    rooms.map(async (room) => {
      const roomConfig = roomConfigMap[room.id];
      const activeIndicatorConfigs = (roomConfig && roomConfig.hasSaved)
        ? RAWAT_INAP_INDICATORS.filter(ind => roomConfig.set.has(ind.id))
        : RAWAT_INAP_INDICATORS;

      const indicators = await Promise.all(
        activeIndicatorConfigs.map(async (ind) => {
          const monthlyData = {};
          let totPeriodNum = 0;
          let totPeriodDen = 0;

          // Helper sums for Triwulan & Semester sub-aggregations
          let tw1Num = 0, tw1Den = 0;
          let tw2Num = 0, tw2Den = 0;

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

              totPeriodNum += num || 0;
              totPeriodDen += den || 0;

              // Categorize into TW1 and TW2 of the Semester
              if (isSemesterMode) {
                const firstHalfRange = startBulan === 1 ? [1, 2, 3] : [7, 8, 9];
                if (firstHalfRange.includes(b)) {
                  tw1Num += num || 0;
                  tw1Den += den || 0;
                } else {
                  tw2Num += num || 0;
                  tw2Den += den || 0;
                }
              }
            } catch (err) {
              console.error(`Error calculating summary for room ${room.nama_unit}, ind ${ind.id}, month ${b}:`, err.message);
              monthlyData[b] = { numerator: 0, denominator: 0, capaian: 0 };
            }
          }

          const totalPeriode = {
            numerator: totPeriodNum,
            denominator: totPeriodDen,
            capaian: calculateCapaian(totPeriodNum, totPeriodDen)
          };

          // Semester sub-aggregates
          let semesterBreakdown = null;
          if (isSemesterMode) {
            const tw1Label = startBulan === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
            const tw2Label = startBulan === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

            semesterBreakdown = {
              tw1: { label: tw1Label, numerator: tw1Num, denominator: tw1Den, capaian: calculateCapaian(tw1Num, tw1Den) },
              tw2: { label: tw2Label, numerator: tw2Num, denominator: tw2Den, capaian: calculateCapaian(tw2Num, tw2Den) },
              totalSemester: { label: semesterLabel, numerator: totPeriodNum, denominator: totPeriodDen, capaian: calculateCapaian(totPeriodNum, totPeriodDen) }
            };
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
            monthlyData,
            totalPeriode,
            semesterBreakdown
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

  // Calculate Total MUTU RS (Aggregated across all rooms) ONLY for rawat_inap category
  let totalRs = [];
  if (kategori === 'rawat_inap') {
    totalRs = indicatorConfigs.map(ind => {
      const monthlyData = {};
      let rsPeriodNum = 0;
      let rsPeriodDen = 0;

      let rsTw1Num = 0, rsTw1Den = 0;
      let rsTw2Num = 0, rsTw2Den = 0;

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

      rsPeriodNum += totNum;
      rsPeriodDen += totDen;

      if (isSemesterMode) {
        const firstHalfRange = startBulan === 1 ? [1, 2, 3] : [7, 8, 9];
        if (firstHalfRange.includes(b)) {
          rsTw1Num += totNum;
          rsTw1Den += totDen;
        } else {
          rsTw2Num += totNum;
          rsTw2Den += totDen;
        }
      }
    }

    const totalPeriode = {
      numerator: rsPeriodNum,
      denominator: rsPeriodDen,
      capaian: calculateCapaian(rsPeriodNum, rsPeriodDen)
    };

    let semesterBreakdown = null;
    if (isSemesterMode) {
      const tw1Label = startBulan === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
      const tw2Label = startBulan === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

      semesterBreakdown = {
        tw1: { label: tw1Label, numerator: rsTw1Num, denominator: rsTw1Den, capaian: calculateCapaian(rsTw1Num, rsTw1Den) },
        tw2: { label: tw2Label, numerator: rsTw2Num, denominator: rsTw2Den, capaian: calculateCapaian(rsTw2Num, rsTw2Den) },
        totalSemester: { label: semesterLabel, numerator: rsPeriodNum, denominator: rsPeriodDen, capaian: calculateCapaian(rsPeriodNum, rsPeriodDen) }
      };
    }

    return {
      no: ind.no,
      id: ind.id,
      nama: ind.nama,
      nama_modul: ind.nama_modul,
      standar: ind.standar,
      monthlyData,
      totalPeriode,
      semesterBreakdown
    };
  });
  }

  return {
    kategori,
    tahun: selectedTahun,
    bulanAwal: startBulan,
    bulanAkhir: endBulan,
    triwulanLabel,
    semesterLabel,
    isSemesterMode,
    bulanList,
    allCategoryUnits: allCategoryUnits.map(u => ({ id: u.id, nama_unit: u.nama_unit, kode_unit: u.kode_unit })),
    rooms: roomResults,
    totalRs
  };
}

/**
 * Generate Excel / ODS workbook for Rekap Data Mutu matching modul-rekap-mutu-rwi.ods layout & UI styling
 */
async function exportRekapMutuExcel({ kategori = 'rawat_inap', tahun = 2026, bulanAwal = 1, bulanAkhir = 3, unitId = 'all' }) {
  const data = await getRekapMutuData({ kategori, tahun, bulanAwal, bulanAkhir, unitId });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');

  const isSem = data.isSemesterMode;
  const extraCols = isSem ? 9 : 3; // 9 cols for Semester (TW1, TW2, Sem) or 3 cols for TW/Periode
  const totalCols = 3 + (data.bulanList.length * 3) + (isSem ? 9 : 3);

  // Title Row (Merged B2 to last column)
  ws.mergeCells(2, 2, 2, totalCols);
  const titleCell = ws.getCell(2, 2);
  const katTitle = kategori === 'rawat_inap' || kategori === 'ranap' ? 'RAWAT INAP' : kategori.toUpperCase();
  titleCell.value = `REKAP CAPAIAN MUTU ${katTitle} RUMAH SAKIT ISLAM KARAWANG TAHUN ${data.tahun}`;
  titleCell.font = { bold: true, size: 13 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Subtitle Row (Merged B3)
  ws.mergeCells(3, 2, 3, totalCols);
  const subTitleCell = ws.getCell(3, 2);
  const bAwalNama = NAMA_BULAN[data.bulanAwal - 1];
  const bAkhirNama = NAMA_BULAN[data.bulanAkhir - 1];
  const periodeText = data.bulanAwal === data.bulanAkhir ? bAwalNama.toUpperCase() : `${bAwalNama.toUpperCase()} S/D ${bAkhirNama.toUpperCase()}`;
  subTitleCell.value = `PERIODE PELAPORAN: ${data.triwulanLabel} (${periodeText} ${data.tahun})`;
  subTitleCell.font = { bold: true, size: 10, color: { argb: 'FF475569' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  let currentRow = 5;

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

    if (isSem) {
      const tw1Label = data.bulanAwal === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
      const tw2Label = data.bulanAwal === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

      // TW1 Header
      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E293B', 'FFFFFFFF');
      ws.getCell(currentRow, colIdx).value = tw1Label;
      colIdx += 3;

      // TW2 Header
      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E293B', 'FFFFFFFF');
      ws.getCell(currentRow, colIdx).value = tw2Label;
      colIdx += 3;

      // TOTAL SEMESTER Header
      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF78350F', 'FFFFFFFF');
      ws.getCell(currentRow, colIdx).value = data.semesterLabel;
    } else {
      // Add TOTAL TRIWULAN Header
      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      const twCell = ws.getCell(currentRow, colIdx);
      twCell.value = data.triwulanLabel;
      applyHeaderStyles(twCell, 'FF1E293B', 'FFFFFFFF');
    }

    currentRow++;

    // Header No & Indikator Row
    const rNo = ws.getCell(currentRow, 2);
    const rInd = ws.getCell(currentRow, 3);
    rNo.value = 'No';
    rInd.value = 'Indikator Mutu';
    applyHeaderStyles(rNo, 'FFD9D9D9');
    applyHeaderStyles(rInd, 'FFD9D9D9');

    // Sub-header Row (N, D, C)
    colIdx = 4;
    data.bulanList.forEach(b => {
      const pal = getExcelMonthPalette(b.bulan);
      const cNum = ws.getCell(currentRow, colIdx);
      const cDen = ws.getCell(currentRow, colIdx + 1);
      const cCap = ws.getCell(currentRow, colIdx + 2);

      cNum.value = 'N'; cDen.value = 'D'; cCap.value = 'C';
      applyHeaderStyles(cNum, pal.subBg); applyHeaderStyles(cDen, pal.subBg); applyHeaderStyles(cCap, pal.capBg);
      colIdx += 3;
    });

    if (isSem) {
      // TW1 Subheaders
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF334155', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF334155', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
      colIdx += 3;

      // TW2 Subheaders
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF334155', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF334155', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
      colIdx += 3;

      // SEMESTER Subheaders
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF92400E', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF92400E', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF78350F', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
    } else {
      const twNum = ws.getCell(currentRow, colIdx);
      const twDen = ws.getCell(currentRow, colIdx + 1);
      const twCap = ws.getCell(currentRow, colIdx + 2);
      twNum.value = 'Tot N'; twDen.value = 'Tot D'; twCap.value = 'C';
      applyHeaderStyles(twNum, 'FF334155', 'FFFFFFFF');
      applyHeaderStyles(twDen, 'FF334155', 'FFFFFFFF');
      applyHeaderStyles(twCap, 'FF1E3A8A', 'FFFFFFFF');
    }

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

      colIdx = 4;
      data.bulanList.forEach(b => {
        const pal = getExcelMonthPalette(b.bulan);
        const d = ind.monthlyData[b.bulan] || { numerator: 0, denominator: 0, capaian: 0 };
        const cNum = ws.getCell(currentRow, colIdx);
        const cDen = ws.getCell(currentRow, colIdx + 1);
        const cCap = ws.getCell(currentRow, colIdx + 2);

        cNum.value = d.numerator; cDen.value = d.denominator; cCap.value = d.capaian; cCap.numFmt = '0.00';
        cNum.alignment = { horizontal: 'center', vertical: 'middle' };
        cDen.alignment = { horizontal: 'center', vertical: 'middle' };
        cCap.alignment = { horizontal: 'center', vertical: 'middle' };
        cCap.font = { bold: true };
        cCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.capBg } };
        applyDataBorder(cNum); applyDataBorder(cDen); applyDataBorder(cCap);
        colIdx += 3;
      });

      if (isSem && ind.semesterBreakdown) {
        const sb = ind.semesterBreakdown;
        // TW1 cells
        const tw1 = sb.tw1;
        const cTw1N = ws.getCell(currentRow, colIdx); const cTw1D = ws.getCell(currentRow, colIdx + 1); const cTw1C = ws.getCell(currentRow, colIdx + 2);
        cTw1N.value = tw1.numerator; cTw1D.value = tw1.denominator; cTw1C.value = tw1.capaian; cTw1C.numFmt = '0.00';
        cTw1N.font = { bold: true }; cTw1D.font = { bold: true }; cTw1C.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTw1N.alignment = { horizontal: 'center', vertical: 'middle' }; cTw1D.alignment = { horizontal: 'center', vertical: 'middle' }; cTw1C.alignment = { horizontal: 'center', vertical: 'middle' };
        cTw1C.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        applyDataBorder(cTw1N); applyDataBorder(cTw1D); applyDataBorder(cTw1C);
        colIdx += 3;

        // TW2 cells
        const tw2 = sb.tw2;
        const cTw2N = ws.getCell(currentRow, colIdx); const cTw2D = ws.getCell(currentRow, colIdx + 1); const cTw2C = ws.getCell(currentRow, colIdx + 2);
        cTw2N.value = tw2.numerator; cTw2D.value = tw2.denominator; cTw2C.value = tw2.capaian; cTw2C.numFmt = '0.00';
        cTw2N.font = { bold: true }; cTw2D.font = { bold: true }; cTw2C.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTw2N.alignment = { horizontal: 'center', vertical: 'middle' }; cTw2D.alignment = { horizontal: 'center', vertical: 'middle' }; cTw2C.alignment = { horizontal: 'center', vertical: 'middle' };
        cTw2C.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        applyDataBorder(cTw2N); applyDataBorder(cTw2D); applyDataBorder(cTw2C);
        colIdx += 3;

        // Semester cells
        const sem = sb.totalSemester;
        const cSemN = ws.getCell(currentRow, colIdx); const cSemD = ws.getCell(currentRow, colIdx + 1); const cSemC = ws.getCell(currentRow, colIdx + 2);
        cSemN.value = sem.numerator; cSemD.value = sem.denominator; cSemC.value = sem.capaian; cSemC.numFmt = '0.00';
        cSemN.font = { bold: true }; cSemD.font = { bold: true }; cSemC.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cSemN.alignment = { horizontal: 'center', vertical: 'middle' }; cSemD.alignment = { horizontal: 'center', vertical: 'middle' }; cSemC.alignment = { horizontal: 'center', vertical: 'middle' };
        cSemC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF78350F' } };
        applyDataBorder(cSemN); applyDataBorder(cSemD); applyDataBorder(cSemC);
      } else {
        const tot = ind.totalPeriode || { numerator: 0, denominator: 0, capaian: 0 };
        const cTwNum = ws.getCell(currentRow, colIdx);
        const cTwDen = ws.getCell(currentRow, colIdx + 1);
        const cTwCap = ws.getCell(currentRow, colIdx + 2);

        cTwNum.value = tot.numerator; cTwDen.value = tot.denominator; cTwCap.value = tot.capaian; cTwCap.numFmt = '0.00';
        cTwNum.font = { bold: true }; cTwDen.font = { bold: true }; cTwCap.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTwNum.alignment = { horizontal: 'center', vertical: 'middle' }; cTwDen.alignment = { horizontal: 'center', vertical: 'middle' }; cTwCap.alignment = { horizontal: 'center', vertical: 'middle' };
        cTwCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        applyDataBorder(cTwNum); applyDataBorder(cTwDen); applyDataBorder(cTwCap);
      }

      currentRow++;
    }

    currentRow += 2;
  }

  // Render TOTAL MUTU RS Summary Table (ONLY for rawat_inap category)
  if (data.kategori === 'rawat_inap' && data.totalRs && data.totalRs.length > 0) {
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

    if (isSem) {
      const tw1Label = data.bulanAwal === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
      const tw2Label = data.bulanAwal === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E40AF', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = `${tw1Label} RS`;
      colIdx += 3;

      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E40AF', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = `${tw2Label} RS`;
      colIdx += 3;

      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF78350F', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = `${data.semesterLabel} RS`;
    } else {
      ws.mergeCells(currentRow, colIdx, currentRow, colIdx + 2);
      const rsTwCell = ws.getCell(currentRow, colIdx);
      rsTwCell.value = `${data.triwulanLabel} RS`;
      applyHeaderStyles(rsTwCell, 'FF1E40AF', 'FFFFFFFF');
    }

    currentRow++;

    const rRsNo = ws.getCell(currentRow, 2);
    const rRsInd = ws.getCell(currentRow, 3);
    rRsNo.value = 'No'; rRsInd.value = 'Indikator Mutu';
    applyHeaderStyles(rRsNo, 'FFD9D9D9'); applyHeaderStyles(rRsInd, 'FFD9D9D9');

    colIdx = 4;
    data.bulanList.forEach(b => {
      const pal = getExcelMonthPalette(b.bulan);
      const cNum = ws.getCell(currentRow, colIdx); const cDen = ws.getCell(currentRow, colIdx + 1); const cCap = ws.getCell(currentRow, colIdx + 2);
      cNum.value = 'Tot N'; cDen.value = 'Tot D'; cCap.value = 'C';
      applyHeaderStyles(cNum, pal.subBg); applyHeaderStyles(cDen, pal.subBg); applyHeaderStyles(cCap, pal.capBg);
      colIdx += 3;
    });

    if (isSem) {
      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF1E40AF', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
      colIdx += 3;

      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF1E3A8A', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF1E40AF', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
      colIdx += 3;

      applyHeaderStyles(ws.getCell(currentRow, colIdx), 'FF92400E', 'FFFFFFFF'); ws.getCell(currentRow, colIdx).value = 'Tot N';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 1), 'FF92400E', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 1).value = 'Tot D';
      applyHeaderStyles(ws.getCell(currentRow, colIdx + 2), 'FF78350F', 'FFFFFFFF'); ws.getCell(currentRow, colIdx + 2).value = 'C';
    } else {
      const rsTwNum = ws.getCell(currentRow, colIdx); const rsTwDen = ws.getCell(currentRow, colIdx + 1); const rsTwCap = ws.getCell(currentRow, colIdx + 2);
      rsTwNum.value = 'Tot N'; rsTwDen.value = 'Tot D'; rsTwCap.value = 'C';
      applyHeaderStyles(rsTwNum, 'FF1E3A8A', 'FFFFFFFF'); applyHeaderStyles(rsTwDen, 'FF1E3A8A', 'FFFFFFFF'); applyHeaderStyles(rsTwCap, 'FF1E40AF', 'FFFFFFFF');
    }

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
        const cNum = ws.getCell(currentRow, colIdx); const cDen = ws.getCell(currentRow, colIdx + 1); const cCap = ws.getCell(currentRow, colIdx + 2);

        cNum.value = d.numerator; cDen.value = d.denominator; cCap.value = d.capaian; cCap.numFmt = '0.00';
        cNum.font = { bold: true }; cDen.font = { bold: true }; cCap.font = { bold: true };
        cNum.alignment = { horizontal: 'center', vertical: 'middle' }; cDen.alignment = { horizontal: 'center', vertical: 'middle' }; cCap.alignment = { horizontal: 'center', vertical: 'middle' };
        cCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.capBg } };
        applyDataBorder(cNum); applyDataBorder(cDen); applyDataBorder(cCap);
        colIdx += 3;
      });

      if (isSem && ind.semesterBreakdown) {
        const sb = ind.semesterBreakdown;
        const tw1 = sb.tw1;
        const cTw1N = ws.getCell(currentRow, colIdx); const cTw1D = ws.getCell(currentRow, colIdx + 1); const cTw1C = ws.getCell(currentRow, colIdx + 2);
        cTw1N.value = tw1.numerator; cTw1D.value = tw1.denominator; cTw1C.value = tw1.capaian; cTw1C.numFmt = '0.00';
        cTw1N.font = { bold: true }; cTw1D.font = { bold: true }; cTw1C.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTw1N.alignment = { horizontal: 'center', vertical: 'middle' }; cTw1D.alignment = { horizontal: 'center', vertical: 'middle' }; cTw1C.alignment = { horizontal: 'center', vertical: 'middle' };
        cTw1C.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        applyDataBorder(cTw1N); applyDataBorder(cTw1D); applyDataBorder(cTw1C);
        colIdx += 3;

        const tw2 = sb.tw2;
        const cTw2N = ws.getCell(currentRow, colIdx); const cTw2D = ws.getCell(currentRow, colIdx + 1); const cTw2C = ws.getCell(currentRow, colIdx + 2);
        cTw2N.value = tw2.numerator; cTw2D.value = tw2.denominator; cTw2C.value = tw2.capaian; cTw2C.numFmt = '0.00';
        cTw2N.font = { bold: true }; cTw2D.font = { bold: true }; cTw2C.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTw2N.alignment = { horizontal: 'center', vertical: 'middle' }; cTw2D.alignment = { horizontal: 'center', vertical: 'middle' }; cTw2C.alignment = { horizontal: 'center', vertical: 'middle' };
        cTw2C.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        applyDataBorder(cTw2N); applyDataBorder(cTw2D); applyDataBorder(cTw2C);
        colIdx += 3;

        const sem = sb.totalSemester;
        const cSemN = ws.getCell(currentRow, colIdx); const cSemD = ws.getCell(currentRow, colIdx + 1); const cSemC = ws.getCell(currentRow, colIdx + 2);
        cSemN.value = sem.numerator; cSemD.value = sem.denominator; cSemC.value = sem.capaian; cSemC.numFmt = '0.00';
        cSemN.font = { bold: true }; cSemD.font = { bold: true }; cSemC.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cSemN.alignment = { horizontal: 'center', vertical: 'middle' }; cSemD.alignment = { horizontal: 'center', vertical: 'middle' }; cSemC.alignment = { horizontal: 'center', vertical: 'middle' };
        cSemC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF78350F' } };
        applyDataBorder(cSemN); applyDataBorder(cSemD); applyDataBorder(cSemC);
      } else {
        const tot = ind.totalPeriode || { numerator: 0, denominator: 0, capaian: 0 };
        const cTwNum = ws.getCell(currentRow, colIdx); const cTwDen = ws.getCell(currentRow, colIdx + 1); const cTwCap = ws.getCell(currentRow, colIdx + 2);
        cTwNum.value = tot.numerator; cTwDen.value = tot.denominator; cTwCap.value = tot.capaian; cTwCap.numFmt = '0.00';
        cTwNum.font = { bold: true }; cTwDen.font = { bold: true }; cTwCap.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cTwNum.alignment = { horizontal: 'center', vertical: 'middle' }; cTwDen.alignment = { horizontal: 'center', vertical: 'middle' }; cTwCap.alignment = { horizontal: 'center', vertical: 'middle' };
        cTwCap.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        applyDataBorder(cTwNum); applyDataBorder(cTwDen); applyDataBorder(cTwCap);
      }

      currentRow++;
    }
  }

  // Set column widths
  ws.getColumn(1).width = 3; ws.getColumn(2).width = 6; ws.getColumn(3).width = 45;
  for (let c = 4; c <= totalCols; c++) { ws.getColumn(c).width = 12; }

  return wb;
}

module.exports = {
  getRekapMutuData,
  exportRekapMutuExcel,
};
