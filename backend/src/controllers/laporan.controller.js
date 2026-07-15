const prisma = require('../config/database');
const XLSX = require('xlsx');

// Import all services
const services = {
  'Risiko Jatuh': { service: require('../services/modules/risiko-jatuh.service'), table: 'risikoJatuh', category: 'Keselamatan Pasien' },
  'Insiden Keselamatan': { service: require('../services/modules/insiden-keselamatan.service'), table: 'insidenKeselamatan', category: 'Keselamatan Pasien' },
  'Identifikasi Pasien': { service: require('../services/modules/identifikasi-pasien.service'), table: 'identifikasiPasien', category: 'Keselamatan Pasien' },
  'Reaksi Transfusi': { service: require('../services/modules/reaksi-transfusi.service'), table: 'reaksiTransfusi', category: 'Keselamatan Pasien' },
  'Gelang Identitas': { service: require('../services/modules/gelang-identitas.service'), table: 'gelangIdentitas', category: 'Keselamatan Pasien' },
  'Serah Terima Pasien': { service: require('../services/modules/serah-terima-pasien.service'), table: 'serahTerimaPasien', category: 'Keselamatan Pasien' },
  'Kepatuhan Kebersihan Tangan': { service: require('../services/modules/kepatuhan-kebersihan-tangan.service'), table: 'kepatuhanKebersihanTangan', category: 'Keselamatan Pasien' },
  'Kepatuhan Penggunaan APD': { service: require('../services/modules/kepatuhan-apd.service'), table: 'kepatuhanApd', category: 'Keselamatan Pasien' },
  
  'Angka Kematian Ranap': { service: require('../services/modules/angka-kematian-ranap.service'), table: 'angkaKematian', category: 'Rawat Inap', extraWhere: { lokasi: 'ranap' } },
  'Double Check High Alert': { service: require('../services/modules/double-check-high-alert.service'), table: 'doubleCheckHighAlert', category: 'Rawat Inap' },
  'Visit Dokter Spesialis': { service: require('../services/modules/visit-dokter.service'), table: 'visitDokter', category: 'Rawat Inap' },
  'Kembali ICU < 72 Jam': { service: require('../services/modules/kembali-icu.service'), table: 'kembaliIcu', category: 'Rawat Inap' },
  'Alur Klinis': { service: require('../services/modules/alur-klinis.service'), table: 'alurKlinis', category: 'Rawat Inap' },
  
  'Waktu Tanggap SC': { service: require('../services/modules/waktu-tanggap-sc.service'), table: 'waktuTanggapSc', category: 'IGD' },
  'Emergency Response Time': { service: require('../services/modules/emergency-response-time.service'), table: 'emergencyResponseTime', category: 'IGD' },
  'Angka Kematian IGD': { service: require('../services/modules/angka-kematian-igd.service'), table: 'angkaKematian', category: 'IGD', extraWhere: { lokasi: 'igd' } },
  'Asesmen Awal IGD': { service: require('../services/modules/asesmen-awal-igd.service'), table: 'asesmenAwalIgd', category: 'IGD' },
  'Pasien Tertahan IGD': { service: require('../services/modules/pasien-tertahan-igd.service'), table: 'pasienTertahanIgd', category: 'IGD' },
  
  'Ketidakpatuhan Pasien HD': { service: require('../services/modules/ketidakpatuhan-hd.service'), table: 'ketidakpatuhanHd', category: 'Hemodialisa' },
  'Insiden Clotting Durante HD': { service: require('../services/modules/insiden-clotting.service'), table: 'insidenClotting', category: 'Hemodialisa' },
  'Insiden Jarum Vena HD': { service: require('../services/modules/insiden-jarum-vena.service'), table: 'insidenJarumVena', category: 'Hemodialisa' },
  
  'Penundaan Operasi Elektif': { service: require('../services/modules/penundaan-operasi.service'), table: 'penundaanOperasi', category: 'Operasi & Anestesi' },
  'Informed Consent Bedah': { service: require('../services/modules/informed-consent-pembedahan.service'), table: 'informedConsent', category: 'Operasi & Anestesi', extraWhere: { jenis: 'pembedahan' } },
  'Informed Consent Anestesi': { service: require('../services/modules/informed-consent-anestesi.service'), table: 'informedConsent', category: 'Operasi & Anestesi', extraWhere: { jenis: 'anestesi' } },
  'Asesmen Pra Bedah': { service: require('../services/modules/asesmen-pra-bedah.service'), table: 'asesmenPraOperasi', category: 'Operasi & Anestesi', extraWhere: { jenis: 'pra_bedah' } },
  'Asesmen Pra Anestesi': { service: require('../services/modules/asesmen-pra-anestesi.service'), table: 'asesmenPraOperasi', category: 'Operasi & Anestesi', extraWhere: { jenis: 'pra_anestesi' } },
  'Surgical Safety Checklist SC': { service: require('../services/modules/surgical-checklist-sc.service'), table: 'surgicalChecklist', category: 'Operasi & Anestesi', extraWhere: { jenis: 'sc' } },
  'Surgical Safety Checklist Op': { service: require('../services/modules/surgical-checklist-operasi.service'), table: 'surgicalChecklist', category: 'Operasi & Anestesi', extraWhere: { jenis: 'operasi_umum' } },
  'Penandaan Lokasi Operasi': { service: require('../services/modules/penandaan-lokasi-operasi.service'), table: 'penandaanLokasiOperasi', category: 'Operasi & Anestesi' },
  'Kejadian Kematian di Meja Operasi': { service: require('../services/modules/mutu-kamar-operasi.service'), table: 'mutuKamarOperasi', category: 'Operasi & Anestesi', extraWhere: { tipe: 'kematian_meja_operasi' } },
  'Kejadian Operasi Salah Sisi': { service: require('../services/modules/mutu-kamar-operasi.service'), table: 'mutuKamarOperasi', category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_sisi' } },
  'Kejadian Operasi Salah Orang': { service: require('../services/modules/mutu-kamar-operasi.service'), table: 'mutuKamarOperasi', category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_orang' } },
  'Kejadian Operasi Salah Prosedur / Tindakan': { service: require('../services/modules/mutu-kamar-operasi.service'), table: 'mutuKamarOperasi', category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_prosedur' } },

  // Gizi
  'Ketepatan Waktu Makanan': { service: require('../services/modules/gizi-waktu-makanan.service'), table: 'giziWaktuMakanan', category: 'Gizi' },
  'Sisa Makanan Pasien': { service: require('../services/modules/gizi-sisa-makanan.service'), table: 'giziSisaMakanan', category: 'Gizi' },
  'Akurasi Pemberian Diet': { service: require('../services/modules/gizi-kesalahan-diet.service'), table: 'giziKesalahanDiet', category: 'Gizi' },
  'Identifikasi Pasien SIMRS': { service: require('../services/modules/gizi-identifikasi-pasien.service'), table: 'giziIdentifikasiPasien', category: 'Gizi' },

  // Rawat Jalan
  'Waktu Tunggu Poliklinik': { service: require('../services/modules/waktu-tunggu-poliklinik.service'), table: 'waktuTungguPoliklinik', category: 'Rawat Jalan' },
  'Waktu Tunggu Operasi Elektif': { service: require('../services/modules/waktu-tunggu-operasi.service'), table: 'waktuTungguOperasi', category: 'Rawat Jalan' },

  // Rehabilitasi Medis
  'Kejadian drop out pasien terhadap pelayanan rehabilitasi medik yang direncanakan': { service: require('../services/modules/rehab-drop-out.service'), table: 'rehabPasienDropOut', category: 'Rehabilitasi Medis' },
  'Tidak adanya kejadian kesalahan tindakan rehabilitasi medik': { service: require('../services/modules/rehab-kesalahan-tindakan.service'), table: 'rehabKesalahanTindakan', category: 'Rehabilitasi Medis' },
  'Waktu tunggu pelayanan rawat jalan rehabilitasi medik': { service: require('../services/modules/rehab-waktu-tunggu.service'), table: 'rehabWaktuTunggu', category: 'Rehabilitasi Medis' },
  'Kepatuhan identitas pasien': { service: require('../services/modules/rehab-kepatuhan-identitas.service'), table: 'rehabKepatuhanIdentitas', category: 'Rehabilitasi Medis' },
  'Kepuasan pasien dengan pelayanan rehabilitasi medik': { service: require('../services/modules/rehab-kepuasan-pasien.service'), table: 'rehabKepuasanPasien', category: 'Rehabilitasi Medis' },

  // Laundry
  'Ketepatan Waktu Penyediaan Linen Bersih': { service: require('../services/modules/laundry-ketepatan-linen.service'), table: 'laundryKetepatanLinen', category: 'Laundry' },
  'Tidak Adanya Kejadian Linen Hilang': { service: require('../services/modules/laundry-linen-hilang.service'), table: 'laundryLinenHilang', category: 'Laundry' },

  // Radiologi
  'Waktu tunggu hasil pelayanan foto thorax (Sesuai jadwal)': { service: require('../services/modules/radiologi-thorax-sesuai-jadwal.service'), table: 'radiologiThoraxSesuaiJadwal', category: 'Radiologi' },
  'Waktu tunggu hasil pelayanan foto thorax (Diluar jadwal)': { service: require('../services/modules/radiologi-thorax-luar-jadwal.service'), table: 'radiologiThoraxLuarJadwal', category: 'Radiologi' },
  'Kejadian Foto Ulang Pasien': { service: require('../services/modules/radiologi-foto-ulang.service'), table: 'radiologiFotoUlang', category: 'Radiologi' },
  'Kelengkapan pengisian form pemberian info tindakan radiologi': { service: require('../services/modules/radiologi-info-tindakan.service'), table: 'radiologiInfoTindakan', category: 'Radiologi' },
  'Kepatuhan Identifikasi Pasien (Radiologi)': { service: require('../services/modules/radiologi-identifikasi-pasien.service'), table: 'radiologiIdentifikasiPasien', category: 'Radiologi' },
};

async function exportExcel(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    if (!periode_id) {
      return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
    }

    const pid = parseInt(periode_id);
    const uid = unit_id ? parseInt(unit_id) : null;

    const queryWhere = { periode_id: pid };
    if (uid) queryWhere.unit_id = uid;

    // Fetch the period details
    const pDetails = await prisma.periode.findUnique({ where: { id: pid } });
    if (!pDetails) {
      return res.status(404).json({ success: false, message: 'Periode tidak ditemukan' });
    }

    const listBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const namaBulan = listBulan[pDetails.bulan - 1];

    const wb = XLSX.utils.book_new();

    // 1. Generate Summary Ringkasan sheet
    const summaryRows = [];
    for (const [name, cfg] of Object.entries(services)) {
      const sw = { ...queryWhere, ...cfg.extraWhere };
      const sum = await cfg.service.getSummary(sw);
      
      let hasil = `${sum.persen || 0}%`;
      if (sum.rataRata !== undefined) hasil = sum.rataRata;
      else if (name.includes('Kematian') || name.includes('Kembali ICU') || name.includes('Clotting') || name === 'Insiden Keselamatan') {
        hasil = sum.total;
      }

      summaryRows.push({
        'Kategori': cfg.category,
        'Indikator Mutu': name,
        'Target': sum.standar,
        'Pencapaian': hasil,
        'Total Data': sum.total || 0
      });
    }
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Mutu');

    // 2. Generate detailed sheets for each indicator
    for (const [name, cfg] of Object.entries(services)) {
      const sw = { ...queryWhere, ...cfg.extraWhere };
      if (cfg.service.ignoreUnitId) {
        delete sw.unit_id;
      }
      
      const records = await prisma[cfg.table].findMany({ where: sw });
      
      // Map records to readable objects
      const rows = records.map((r, idx) => {
        const flat = { 'No': idx + 1 };
        
        // Add basic common fields
        if (r.nama_pasien) flat['Nama Pasien'] = r.nama_pasien;
        if (r.no_rm) flat['No RM'] = r.no_rm;
        if (r.usia) flat['Usia'] = r.usia;
        if (r.dpjp) flat['DPJP'] = r.dpjp;
        if (r.tanggal) flat['Tanggal'] = new Date(r.tanggal).toLocaleDateString('id-ID');
        if (r.tanggal_penjadwalan) flat['Tanggal Penjadwalan'] = new Date(r.tanggal_penjadwalan).toLocaleDateString('id-ID');
        if (r.tanggal_operasi) flat['Tanggal Operasi'] = new Date(r.tanggal_operasi).toLocaleDateString('id-ID');
        
        // Add model-specific fields
        for (const key in r) {
          if (['id', 'periode_id', 'unit_id', 'created_by', 'created_at', 'updated_at', 'nama_pasien', 'no_rm', 'usia', 'dpjp', 'tanggal', 'lokasi', 'jenis', 'tanggal_penjadwalan', 'tanggal_operasi'].includes(key)) {
            continue;
          }
          
          // Make boolean and enum fields human readable
          let val = r[key];
          if (val === true) val = 'Ya / Sesuai';
          else if (val === false) val = 'Tidak';
          else if (val instanceof Date) {
            val = val.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          }
          
          // Standardize key name to title case/human readable
          const keyLabel = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          flat[keyLabel] = val;
        }

        let hasilVal = null;
        if (cfg.table === 'radiologiThoraxSesuaiJadwal' || cfg.table === 'radiologiThoraxLuarJadwal') {
          const jp = r.jumlah_pasien || 0;
          const waktu = r.waktu || 0;
          hasilVal = jp > 0 ? `${Math.round(waktu / jp)} menit/pasien` : '0 menit/pasien';
        } else if (cfg.table === 'radiologiFotoUlang') {
          const over = r.over_exposure || 0;
          const under = r.under_exposure || 0;
          const pos = r.positioning || 0;
          const art = r.artefac || 0;
          const equit = r.equitmen || 0;
          const jp = r.jumlah_pemeriksaan || 0;
          const totalKejadian = over + under + pos + art + equit;
          hasilVal = jp > 0 ? `${parseFloat(((totalKejadian / jp) * 100).toFixed(2))}%` : '0%';
        } else if (cfg.table === 'radiologiInfoTindakan') {
          const jp = r.jumlah_pemeriksaan || 0;
          const kp = r.kepatuhan_pengisian || 0;
          hasilVal = jp > 0 ? `${parseFloat(((kp / jp) * 100).toFixed(2))}%` : '0%';
        } else if (cfg.table === 'radiologiIdentifikasiPasien') {
          const fields = ['pemberian_obat', 'pemberian_nutrisi', 'pemberian_darah', 'pengambilan_spesimen', 'melakukan_tindakan'];
          let num = 0;
          let den = 0;
          fields.forEach(f => {
            if (r[f] !== 'tidak_ada_peluang' && r[f] !== 'tidak ada peluang') {
              den++;
              if (r[f] === 'dilakukan') num++;
            }
          });
          hasilVal = den > 0 ? `${parseFloat(((num / den) * 100).toFixed(2))}%` : '100%';
        }

        if (hasilVal !== null) {
          flat['Hasil'] = hasilVal;
        }

        return flat;
      });

      // Sheet names must be <= 31 chars
      let sheetName = name.substring(0, 30);
      let counter = 1;
      while (wb.SheetNames.includes(sheetName)) {
        const suffix = `_${counter}`;
        sheetName = name.substring(0, 30 - suffix.length) + suffix;
        counter++;
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Write to buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Mutu_${namaBulan}_${pDetails.tahun}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);

  } catch (err) {
    next(err);
  }
}

// Importer function for migrasi data
async function importExcel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File Excel tidak ditemukan' });
    }

    // Parse uploaded excel file
    const wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    
    // Excel importer reads each sheet and migrates to DB.
    // For demo/simplicity, we can parse 'Risiko Jatuh' and 'Identifikasi Pasien' sheets.
    // In real use, we parse sheets matching table names.
    let importedCount = 0;

    // Get active period or default
    let activePeriode = await prisma.periode.findFirst({ where: { status: 'open' } });
    if (!activePeriode) {
      activePeriode = await prisma.periode.findFirst();
    }

    for (const sheetName of wb.SheetNames) {
      if (sheetName === 'Ringkasan Mutu') continue;

      // Find the service config matching sheet name exactly (up to 30 chars, matching Excel's export limit)
      const match = Object.entries(services).find(([name]) => {
        const exportedSheetName = name.substring(0, 30).toLowerCase();
        return sheetName.toLowerCase().trim() === exportedSheetName.trim();
      });
      if (!match) continue;

      const [name, cfg] = match;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws);

      for (const row of rows) {
        // Build data payload
        const payload = {
          periode_id: activePeriode ? activePeriode.id : 1,
          created_by: req.user.id,
        };

        // Attempt to parse standard columns
        if (row['Nama Pasien']) payload.nama_pasien = String(row['Nama Pasien']);
        if (row['No RM']) payload.no_rm = String(row['No RM']);
        if (row['Usia']) payload.usia = parseInt(row['Usia']) || 0;
        if (row['DPJP']) payload.dpjp = String(row['DPJP']);
        if (row['Tanggal']) payload.tanggal = new Date(row['Tanggal']);

        // Check if there is unit_id, otherwise assign default unit
        if (!cfg.service.ignoreUnitId) {
          payload.unit_id = req.user.unit_id || 1; // Default to user's unit or 1
        }

        // Try mapping other properties
        for (const [rowKey, rowVal] of Object.entries(row)) {
          if (['No', 'Nama Pasien', 'No RM', 'Usia', 'DPJP', 'Tanggal'].includes(rowKey)) continue;

          // Convert label back to database field key
          const dbKey = rowKey.toLowerCase().replace(/ /g, '_');
          
          // Map values
          let val = rowVal;
          if (String(rowVal).startsWith('Ya') || String(rowVal).startsWith('Sesuai')) val = true;
          else if (String(rowVal).startsWith('Tidak')) val = false;

          // Check if this property exists in the model
          payload[dbKey] = val;
        }

        // Add discriminator columns
        if (cfg.extraWhere) {
          Object.assign(payload, cfg.extraWhere);
        }

        // Clean values before writing
        for (const key in payload) {
          if (payload[key] === undefined) delete payload[key];
        }

        try {
          await prisma[cfg.table].create({ data: payload });
          importedCount++;
        } catch (err) {
          console.error(`Import failed for row in sheet ${sheetName}:`, err.message);
        }
      }
    }

    res.json({ success: true, message: `Berhasil mengimpor ${importedCount} record data dari file Excel.` });

  } catch (err) {
    next(err);
  }
}

module.exports = { exportExcel, importExcel };
