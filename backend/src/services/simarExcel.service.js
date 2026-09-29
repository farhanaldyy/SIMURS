const ExcelJS = require('exceljs');
const simarService = require('./simarFormatter.service');

/**
 * Generates official Kemenkes INM SIMAR format Excel workbook (.xlsx)
 */
async function generateSimarExcelWorkbook({ bulan, tahun }) {
  const reportData = await simarService.generateInmReport({ bulan, tahun });
  const { header, indikator_list } = reportData;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIMURS - Sistem Informasi Mutu Rumah Sakit';
  workbook.lastModifiedBy = 'SIMURS Auto-Generator';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Laporan INM SIMAR Kemenkes', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Title & Fasyankes Header Rows
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'KEMENTERIAN KESEHATAN REPUBLIK INDONESIA';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:G2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = 'LAPORAN REKAPITULASI INDIKATOR NASIONAL MUTU (INM) RUMAH SAKIT';
  subtitleCell.font = { name: 'Arial', size: 12, bold: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // Blank row

  // Metadata Table Info
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const namaBulan = monthNames[(header.periode_bulan || 1) - 1] || 'Januari';

  const metaRows = [
    ['Nama Fasyankes / RS', `: ${header.nama_fasyankes}`],
    ['Kode Fasyankes Kemenkes', `: ${header.kode_fasyankes || '-'}`],
    ['Periode Pelaporan', `: ${namaBulan} ${header.periode_tahun}`],
    ['Mode Integrasi System', `: ${header.mode_integrasi.toUpperCase()}`],
    ['Tanggal Generate File', `: ${new Date(header.generated_at).toLocaleString('id-ID')}`],
  ];

  metaRows.forEach((row) => {
    const r = worksheet.addRow([row[0], row[1]]);
    r.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF334155' } };
    r.getCell(2).font = { name: 'Arial', size: 10, color: { argb: 'FF0F172A' } };
  });

  worksheet.addRow([]); // Blank row

  // Data Table Headers
  const headerRow = worksheet.addRow([
    'NO',
    'KODE INM',
    'NAMA INDIKATOR MUTU KEMENKES',
    'NUMERATOR',
    'DENOMINATOR',
    'CAPAIAN (%)',
    'TARGET (%)',
    'STATUS KEPATUHAN'
  ]);

  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Kemenkes Navy
    };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Data Rows
  indikator_list.forEach((ind, index) => {
    const isTercapai = ind.status_tercapai;
    const statusText = isTercapai ? 'TERCAPAI' : 'BELUM TERCAPAI';

    const row = worksheet.addRow([
      index + 1,
      ind.kode_inm || '-',
      ind.nama_indikator,
      ind.numerator || 0,
      ind.denominator || 0,
      ind.capaian_persentase ? `${ind.capaian_persentase}%` : '0%',
      ind.target ? `${ind.target}%` : '-',
      statusText
    ]);

    row.height = 22;
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

    // Status Cell Styling
    const statusCell = row.getCell(8);
    if (isTercapai) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Soft Green
      statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF166534' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Soft Red
      statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF991B1B' } };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Column Widths
  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 14;
  worksheet.getColumn(3).width = 45;
  worksheet.getColumn(4).width = 16;
  worksheet.getColumn(5).width = 16;
  worksheet.getColumn(6).width = 16;
  worksheet.getColumn(7).width = 14;
  worksheet.getColumn(8).width = 20;

  return workbook;
}

module.exports = {
  generateSimarExcelWorkbook,
};
