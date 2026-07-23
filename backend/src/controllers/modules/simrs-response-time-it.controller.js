const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/simrs-response-time-it.service');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const prisma = require('../../config/database');

const baseCtrl = createGenericController(service);

function formatJamString(val) {
  if (val === null || val === undefined || val === '') return '';

  // 1. If Date object (e.g. SheetJS parsed native Excel Time cell)
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const h = String(val.getUTCHours()).padStart(2, '0');
    const m = String(val.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // 2. If Number (Excel time fraction, timestamp, or integer like 830)
  if (typeof val === 'number') {
    if (val >= 100 && val <= 2359 && Number.isInteger(val)) {
      const h = String(Math.floor(val / 100)).padStart(2, '0');
      const m = String(val % 100).padStart(2, '0');
      return `${h}:${m}`;
    }
    let frac = val % 1;
    if (frac < 0) frac += 1;
    const totalSec = Math.round(frac * 86400);
    const h = String(Math.floor(totalSec / 3600) % 24).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    return `${h}:${m}`;
  }

  // 3. If String
  let str = String(val).trim();
  if (!str) return '';

  // Handle AM/PM time format (e.g. "12:00:00 PM", "01:00:00 PM", "1:00 PM", "12:00 AM")
  const ampmMatch = str.match(/^(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && h < 12) {
      h += 12;
    } else if (period === 'AM' && h === 12) {
      h = 0;
    }
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  // Normalize dot separator (e.g. 08.30 or 8.30 -> 08:30)
  if (str.includes('.') && !str.includes(':')) {
    str = str.replace('.', ':');
  }

  if (str.includes(':')) {
    const parts = str.split(':');
    const hNum = parseInt(parts[0], 10);
    const mNum = parseInt(parts[1], 10);
    if (!isNaN(hNum) && !isNaN(mNum)) {
      const h = String(hNum % 24).padStart(2, '0');
      const m = String(mNum % 60).padStart(2, '0');
      return `${h}:${m}`;
    }
  }

  // Handle 3-4 digit string inputs like '0830' or '830'
  if (/^\d{3,4}$/.test(str)) {
    const num = parseInt(str, 10);
    const h = String(Math.floor(num / 100)).padStart(2, '0');
    const m = String(num % 100).padStart(2, '0');
    return `${h}:${m}`;
  }

  return str;
}

function formatDateString(val) {
  if (!val) return '-';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '-';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return str;
}

module.exports = {
  ...baseCtrl,

  async downloadTemplate(req, res, next) {
    try {
      // Fetch active unit names from DB
      const dbUnits = await prisma.unit.findMany({
        where: { aktif: true },
        select: { nama_unit: true },
        orderBy: { nama_unit: 'asc' }
      });
      const unitNames = dbUnits.length > 0 ? dbUnits.map(u => u.nama_unit) : ['Jabal Nur', 'UGD', 'Assyifa', 'Poli Klinik'];
      const statusOptions = ['Selesai', 'Belum Selesai', 'Lainnya'];
      const petugasOptions = ['Muhamad Sarip', 'Panji Prasetyo', 'Farhan Aldiansyah'];

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIMURS RS';

      // Sheet 1: Main Template
      const wsMain = workbook.addWorksheet('Template SIMRS IT');

      // Sheet 2: Referensi Data
      const wsRef = workbook.addWorksheet('Referensi Data');

      // Setup Referensi Data Columns
      wsRef.columns = [
        { header: 'Unit Diperbaiki (Pilihan)', key: 'unit', width: 30 },
        { header: 'Status (Pilihan)', key: 'status', width: 20 },
        { header: 'Petugas (Pilihan)', key: 'petugas', width: 25 }
      ];

      const refHeader = wsRef.getRow(1);
      refHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      refHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };

      const maxRows = Math.max(unitNames.length, statusOptions.length, petugasOptions.length);
      for (let i = 0; i < maxRows; i++) {
        wsRef.addRow({
          unit: unitNames[i] || '',
          status: statusOptions[i] || '',
          petugas: petugasOptions[i] || ''
        });
      }

      // Setup Main Sheet Columns
      wsMain.columns = [
        { key: 'tanggal', width: 16 },
        { key: 'unit_diperbaiki', width: 28 },
        { key: 'permasalahan', width: 38 },
        { key: 'jam_laporan', width: 16 },
        { key: 'jam_tindakan', width: 16 },
        { key: 'status', width: 18 },
        { key: 'petugas', width: 24 }
      ];

      // Banner Row (Row 1)
      wsMain.mergeCells('A1:G1');
      const bannerCell = wsMain.getCell('A1');
      bannerCell.value = '📌 INFORMASI PENTING: Data harus sesuai dengan contoh template ini. Silakan isi data di bawah baris header dan gunakan pilihan dropdown.';
      bannerCell.font = { bold: true, color: { argb: 'FF1E3A8A' }, size: 10 };
      bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
      bannerCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      wsMain.getRow(1).height = 30;

      // Header Row (Row 2)
      const headers = ['Tanggal', 'Unit Diperbaiki', 'Permasalahan', 'Jam Laporan', 'Jam Tindakan', 'Status', 'Petugas'];
      const mainHeader = wsMain.getRow(2);
      mainHeader.values = headers;
      mainHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      mainHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      mainHeader.alignment = { vertical: 'middle', horizontal: 'center' };
      wsMain.getRow(2).height = 25;

      // Add Sample Rows (Starting from Row 3)
      wsMain.addRow({
        tanggal: '2026-07-20',
        unit_diperbaiki: unitNames[0] || 'Jabal Nur',
        permasalahan: 'Koneksi LAN Terputus',
        jam_laporan: '08:30',
        jam_tindakan: '08:42',
        status: 'Selesai',
        petugas: 'Muhamad Sarip'
      });
      wsMain.addRow({
        tanggal: '2026-07-20',
        unit_diperbaiki: unitNames[1] || 'UGD',
        permasalahan: 'Printer Billing Rusak',
        jam_laporan: '09:15',
        jam_tindakan: '09:25',
        status: 'Selesai',
        petugas: 'Panji Prasetyo'
      });
      wsMain.addRow({
        tanggal: '2026-07-20',
        unit_diperbaiki: unitNames[2] || 'Assyifa',
        permasalahan: 'SIMRS Error Saat Input Resep',
        jam_laporan: '10:00',
        jam_tindakan: '10:20',
        status: 'Belum Selesai',
        petugas: 'Farhan Aldiansyah'
      });

      // Data validation dropdown formulae referencing Sheet 2 ('Referensi Data')
      const unitFormula = `'Referensi Data'!$A$2:$A$${unitNames.length + 1}`;
      const statusFormula = `'Referensi Data'!$B$2:$B$${statusOptions.length + 1}`;
      const petugasFormula = `'Referensi Data'!$C$2:$C$${petugasOptions.length + 1}`;

      // Apply Data Validation Picklist (Dropdown) to rows 3 to 500
      for (let r = 3; r <= 500; r++) {
        wsMain.getCell(`B${r}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [unitFormula],
          showErrorMessage: true,
          errorTitle: 'Pilihan Unit Tidak Valid',
          error: 'Silakan pilih nama unit dari daftar dropdown yang tersedia'
        };

        wsMain.getCell(`F${r}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [statusFormula],
          showErrorMessage: true,
          errorTitle: 'Pilihan Status Tidak Valid',
          error: 'Silakan pilih status dari daftar dropdown yang tersedia'
        };

        wsMain.getCell(`G${r}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [petugasFormula],
          showErrorMessage: true,
          errorTitle: 'Pilihan Petugas Tidak Valid',
          error: 'Silakan pilih nama petugas dari daftar dropdown yang tersedia'
        };
      }

      const buf = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_Response_Time_SIMRS_IT.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buf);
    } catch (err) {
      next(err);
    }
  },

  async importExcel(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File Excel wajib diunggah' });
      }

      let periode_id = req.body.periode_id || req.query.periode_id;
      if (!periode_id) {
        const activePeriode = await prisma.periode.findFirst({ where: { status: 'open' } }) || await prisma.periode.findFirst();
        if (activePeriode) periode_id = activePeriode.id;
      }

      if (!periode_id) {
        return res.status(400).json({ success: false, message: 'Periode aktif tidak ditemukan. Silakan pilih periode pada header.' });
      }

      let unit_id = (req.body && req.body.unit_id) || (req.query && req.query.unit_id) || (req.user ? req.user.unit_id : 1);

      const wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      let rows = XLSX.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'File Excel kosong atau format sheet tidak sesuai' });
      }

      // Check if Row 1 was a banner cell instead of headers
      const hasHeaderKeys = 'Tanggal' in rows[0] || 'Unit Diperbaiki' in rows[0] || 'Permasalahan' in rows[0];
      if (!hasHeaderKeys) {
        rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });
      }

      if (!rows || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'File Excel kosong atau format sheet tidak sesuai' });
      }

      // Fetch all units from DB for case-insensitive lookup & validation
      const dbUnits = await prisma.unit.findMany({ select: { id: true, nama_unit: true } });
      const unitMap = new Map();
      dbUnits.forEach(u => unitMap.set(u.nama_unit.trim().toLowerCase(), u.nama_unit));

      const ALLOWED_STATUS = ['Selesai', 'Belum Selesai', 'Lainnya'];
      const ALLOWED_PETUGAS = ['Muhamad Sarip', 'Panji Prasetyo', 'Farhan Aldiansyah'];

      const validPayloads = [];
      const rowErrors = [];
      let failedCount = 0;

      rows.forEach((row, idx) => {
        const rowNum = hasHeaderKeys ? idx + 2 : idx + 3; // Excel row index
        const msgs = [];

        const tglRaw = row['Tanggal'];
        const tglStr = formatDateString(tglRaw);
        if (!tglRaw || tglStr === '-' || isNaN(new Date(tglStr).getTime())) {
          msgs.push('Tanggal tidak valid');
        }

        const unitRaw = String(row['Unit Diperbaiki'] || row['Unit'] || '').trim();
        let officialUnitName = '';
        if (!unitRaw) {
          msgs.push('Unit Diperbaiki wajib diisi');
        } else {
          officialUnitName = unitMap.get(unitRaw.toLowerCase());
          if (!officialUnitName) {
            msgs.push(`Unit Diperbaiki '${unitRaw}' tidak terdaftar pada Master Data Unit`);
          }
        }

        const masalah = String(row['Permasalahan'] || '').trim();
        if (!masalah) {
          msgs.push('Permasalahan wajib diisi');
        }

        const jamLapRaw = row['Jam Laporan'];
        const jamTindRaw = row['Jam Tindakan'];
        const jamLapStr = formatJamString(jamLapRaw);
        const jamTindStr = formatJamString(jamTindRaw);

        if (!jamLapRaw || !jamLapStr || !jamLapStr.includes(':')) {
          msgs.push('Jam Laporan wajib diisi (HH:MM)');
        }
        if (!jamTindRaw || !jamTindStr || !jamTindStr.includes(':')) {
          msgs.push('Jam Tindakan wajib diisi (HH:MM)');
        }

        const statusVal = String(row['Status'] || '').trim();
        if (!statusVal) {
          msgs.push('Status wajib diisi');
        } else if (!ALLOWED_STATUS.includes(statusVal)) {
          msgs.push(`Status '${statusVal}' tidak valid (Pilihan: ${ALLOWED_STATUS.join(', ')})`);
        }

        const petugasVal = String(row['Petugas'] || '').trim();
        if (!petugasVal) {
          msgs.push('Petugas wajib diisi');
        } else if (!ALLOWED_PETUGAS.includes(petugasVal)) {
          msgs.push(`Petugas '${petugasVal}' tidak valid (Pilihan: ${ALLOWED_PETUGAS.join(', ')})`);
        }

        if (msgs.length > 0) {
          failedCount++;
          rowErrors.push(`Baris ${rowNum}: ${msgs.join('; ')}`);
        } else {
          validPayloads.push({
            periode_id: parseInt(periode_id),
            unit_id: parseInt(unit_id),
            unit_diperbaiki: officialUnitName,
            tanggal: tglStr,
            permasalahan: masalah,
            jam_laporan: jamLapStr,
            jam_tindakan: jamTindStr,
            status: statusVal,
            petugas: petugasVal
          });
        }
      });

      let successCount = 0;
      for (const payload of validPayloads) {
        try {
          await service.create(payload, req.user.id);
          successCount++;
        } catch (err) {
          failedCount++;
          rowErrors.push(`Gagal menyimpan data baris: ${err.message}`);
        }
      }

      res.json({
        success: successCount > 0,
        message: successCount > 0
          ? `Import selesai: ${successCount} data berhasil di-import${failedCount > 0 ? `, ${failedCount} data gagal.` : '.'}`
          : `Import gagal: Seluruh ${failedCount} data Excel tidak sesuai validasi.`,
        importedCount: successCount,
        failedCount,
        errors: rowErrors
      });

    } catch (err) {
      next(err);
    }
  }
};
