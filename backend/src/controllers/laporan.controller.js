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

  // Farmasi
  'Kepatuhan Pelaksanaan Double Check Obat High Alert': { service: require('../services/modules/mutu-farmasi.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'double_check' } },
  'Ketidaktersediaan Obat di Farmasi di Rawat Jalan': { service: require('../services/modules/mutu-farmasi.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'tidak_tersedia_rajal' } },
  'Ketidaktersediaan Obat di Farmasi di Rawat Inap': { service: require('../services/modules/mutu-farmasi.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'tidak_tersedia_ranap' } },
  'Waktu Tunggu Obat Racikan dan Non Racikan': { service: require('../services/modules/mutu-farmasi.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'waktu_tunggu' } },
  'Rata Rata Menut waktu tunggu': { service: require('../services/modules/mutu-farmasi.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'rata_waktu_tunggu' } },
  'Kesalahan Penyerahan Obat Kepada Pasien': { service: require('../services/modules/kesalahan-penyerahan-obat.service'), table: 'mutuFarmasiKesalahanObat', category: 'Farmasi' },
  'Kepatuhan penggunaan formularium nasional': { service: require('../services/modules/kepatuhan-fornas.service'), table: 'mutuFarmasi', category: 'Farmasi', extraWhere: { tipe: 'kepatuhan_fornas' } },

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

  // Laboratorium
  'Jadwal Dokter Laboratorium': { service: require('../services/modules/laboratorium-jadwal-dokter.service'), table: 'laboratoriumJadwalDokter', category: 'Laboratorium' },
  'Waktu tunggu hasil pemeriksaan laboratorium (< 140 Menit)': { service: require('../services/modules/laboratorium-waktu-tunggu-lt-140.service'), table: 'laboratoriumWaktuTungguLt140', category: 'Laboratorium' },
  'Waktu tunggu hasil pemeriksaan laboratorium (> 140 Menit)': { service: require('../services/modules/laboratorium-waktu-tunggu-gt-140.service'), table: 'laboratoriumWaktuTungguGt140', category: 'Laboratorium' },
  'Pelaporan hasil kritis laboratorium  ≤ 30 menit': { service: require('../services/modules/laboratorium-hasil-kritis.service'), table: 'laboratoriumHasilKritis', category: 'Laboratorium' },
  'Tidak adanya kesalahan hasil input pemeriksaan lab': { service: require('../services/modules/laboratorium-kesalahan-input.service'), table: 'laboratoriumKesalahanInput', category: 'Laboratorium' },
  'Tidak adanya kerusakan sampel di laboratorium': { service: require('../services/modules/laboratorium-kerusakan-sampel.service'), table: 'laboratoriumKerusakanSampel', category: 'Laboratorium' },
  'Kepatuhan Identifikasi Pasien Laboratorium': { service: require('../services/modules/laboratorium-kepatuhan-identifikasi.service'), table: 'laboratoriumKepatuhanIdentifikasi', category: 'Laboratorium' },
  'Data Ekspertisi Oleh Dokter Laboratorium': { service: require('../services/modules/laboratorium-ekspertisi-dokter.service'), table: 'laboratoriumEkspertisiDokter', category: 'Laboratorium' },

  // SIMRS
  'Response Time SIMRS IT': { service: require('../services/modules/simrs-response-time-it.service'), table: 'simrsResponseTimeIt', category: 'SIMRS' },

  // Rekam Medis
  'Kelengkapan Dokumen Rekam Medis Pasien Ranap': { service: require('../services/modules/mutu-rekam-medis.service'), table: 'mutuRekamMedis', category: 'Rekam Medis', extraWhere: { tipe: 'kelengkapan_ranap' } },
  'Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam': { service: require('../services/modules/mutu-rekam-medis.service'), table: 'mutuRekamMedis', category: 'Rekam Medis', extraWhere: { tipe: 'pengembalian_rm' } },
  'Pemberian Informasi Antrian Online': { service: require('../services/modules/mutu-rekam-medis.service'), table: 'mutuRekamMedis', category: 'Rekam Medis', extraWhere: { tipe: 'antrian_online' } },
  'Ketepatan Coding Rawat Inap & Rawat Jalan': { service: require('../services/modules/mutu-rekam-medis.service'), table: 'mutuRekamMedis', category: 'Rekam Medis', extraWhere: { tipe: 'ketepatan_coding' } },
  'Antrian Mobile JKN': { service: require('../services/modules/mutu-rekam-medis.service'), table: 'mutuRekamMedis', category: 'Rekam Medis', extraWhere: { tipe: 'mobile_jkn' } },
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
    const serviceEntries = Object.entries(services);
    const summaryRows = await Promise.all(
      serviceEntries.map(async ([name, cfg]) => {
        const sw = { ...queryWhere, ...cfg.extraWhere };
        const sum = await cfg.service.getSummary(sw);
        
        let hasil = `${sum.persen || 0}%`;
        if (sum.rataRata !== undefined) hasil = sum.rataRata;
        else if (name.includes('Kematian') || name.includes('Kembali ICU') || name.includes('Clotting') || name === 'Insiden Keselamatan') {
          hasil = sum.total;
        }

        return {
          'Kategori': cfg.category,
          'Indikator Mutu': name,
          'Target': sum.standar,
          'Pencapaian': hasil,
          'Total Data': sum.total || 0
        };
      })
    );
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Mutu');

    // 2. Fetch all detailed records concurrently
    const detailedSheetEntries = await Promise.all(
      Object.entries(services).map(async ([name, cfg]) => {
        const sw = { ...queryWhere, ...cfg.extraWhere };
        if (cfg.service.ignoreUnitId) delete sw.unit_id;
        if (cfg.table === 'mutuFarmasiKesalahanObat') delete sw.tipe;
        const records = await prisma[cfg.table].findMany({ where: sw });
        return { name, cfg, records };
      })
    );

    // 3. Generate detailed sheets for each indicator
    for (const { name, cfg, records } of detailedSheetEntries) {
      if (!records || records.length === 0) continue;
      
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
        } else if (cfg.table === 'laboratoriumWaktuTungguLt140') {
          const jp = r.jumlah_pasien || 0;
          const waktu = r.waktu || 0;
          hasilVal = jp > 0 ? `${Math.round(waktu / jp)} menit/pasien` : '0 menit/pasien';
        } else if (cfg.table === 'laboratoriumWaktuTungguGt140') {
          const jp = r.jumlah_pasien || 0;
          const gt = r.prx_gt_140 || 0;
          const lt = jp - gt;
          const presentase = jp > 0 ? parseFloat(((lt / jp) * 100).toFixed(2)) : 0;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'laboratoriumHasilKritis') {
          const nk = r.nilai_kritis || 0;
          const lt = r.lt_30 || 0;
          const presentase = nk > 0 ? parseFloat(((lt / nk) * 100).toFixed(2)) : 0;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'laboratoriumKesalahanInput') {
          const jp = r.jumlah_pasien || 0;
          const jk = r.jumlah_kesalahan || 0;
          const presentase = jp > 0 ? parseFloat((((jp - jk) / jp) * 100).toFixed(2)) : 100;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'laboratoriumKerusakanSampel') {
          const jp = r.jumlah_pasien || 0;
          const jk = r.jumlah_kerusakan || 0;
          const presentase = jp > 0 ? parseFloat((((jp - jk) / jp) * 100).toFixed(2)) : 100;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'laboratoriumKepatuhanIdentifikasi') {
          const jp = r.jumlah_pasien || 0;
          const jk = r.jumlah_kepatuhan || 0;
          const presentase = jp > 0 ? parseFloat(((jk / jp) * 100).toFixed(2)) : 100;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'laboratoriumEkspertisiDokter') {
          const jp = r.jumlah_pasien || 0;
          const je = r.ekspertisi_dokter || 0;
          const presentase = jp > 0 ? parseFloat(((je / jp) * 100).toFixed(2)) : 0;
          hasilVal = `${presentase}%`;
        } else if (cfg.table === 'mutuFarmasi') {
          const t = r.tipe;
          const val1 = r.val1 || 0;
          const val2 = r.val2 || 0;
          const val3 = r.val3 || 0;
          const val4 = r.val4 || 0;
          
          delete flat['Tipe'];
          delete flat['Val1'];
          delete flat['Val2'];
          delete flat['Val3'];
          delete flat['Val4'];

          if (t === 'double_check') {
            flat['Total Obat (D)'] = val1;
            flat['Total Double Check (N)'] = val2;
            flat['Tidak Double Check'] = val1 - val2;
            hasilVal = val1 > 0 ? `${parseFloat(((val2 / val1) * 100).toFixed(2))}%` : '0%';
          } else if (t === 'tidak_tersedia_rajal') {
            flat['Total Obat (D)'] = val1;
            flat['Total Tidak Tersedia (N)'] = val2;
            hasilVal = val1 > 0 ? `${parseFloat((val2 / val1).toFixed(4))}%` : '0%';
          } else if (t === 'tidak_tersedia_ranap') {
            flat['Total Obat (D)'] = val1;
            flat['Total Tidak Tersedia (N)'] = val2;
            hasilVal = val1 > 0 ? `${parseFloat((val2 / val1).toFixed(4))}%` : '0%';
          } else if (t === 'waktu_tunggu') {
            flat['Total Obat Racikan'] = val1;
            flat['Total Tunggu Racikan <= 60 Menit'] = val2;
            flat['Total Obat Non Racikan'] = val3;
            flat['Total Tunggu Non Racikan <= 30 Menit'] = val4;
            const totalObat = val1 + val3;
            const totalTunggu = val2 + val4;
            hasilVal = totalObat > 0 ? `${parseFloat(((totalTunggu / totalObat) * 100).toFixed(2))}%` : '0%';
          } else if (t === 'rata_waktu_tunggu') {
            flat['Rata-Rata Waktu Tunggu Racikan (Menit)'] = `${val1} Menit`;
            flat['Rata-Rata Waktu Tunggu Non-Racikan (Menit)'] = `${val2} Menit`;
            hasilVal = `Racikan: ${val1}m, Non-Racikan: ${val2}m`;
          } else if (t === 'kepatuhan_fornas') {
            flat['Total Resep'] = val1;
            flat['Total Resep Sesuai Fornas'] = val2;
            hasilVal = val1 > 0 ? `${parseFloat(((val2 / val1) * 100).toFixed(2))}%` : '0%';
          }
        } else if (cfg.table === 'mutuFarmasiKesalahanObat') {
          const resepRajal = r.resep_rajal || 0;
          const resepRanap = r.resep_ranap || 0;
          const resepIgd = r.resep_igd || 0;
          const salahRajal = r.salah_rajal || 0;
          const salahRanap = r.salah_ranap || 0;
          const salahIgd = r.salah_igd || 0;

          const totalResep = resepRajal + resepRanap + resepIgd;
          const totalSalah = salahRajal + salahRanap + salahIgd;
          const persen = totalSalah === 0 ? 100 : parseFloat(((totalResep / totalSalah) * 100).toFixed(2));

          delete flat['Periode Id'];
          delete flat['Created By'];
          delete flat['Created At'];
          delete flat['Updated At'];
          delete flat['Resep Rajal'];
          delete flat['Resep Ranap'];
          delete flat['Resep Igd'];
          delete flat['Salah Rajal'];
          delete flat['Salah Ranap'];
          delete flat['Salah Igd'];
          delete flat['Tanggal'];

          flat['Tanggal'] = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-';
          flat['Resep Rawat Jalan'] = resepRajal;
          flat['Resep Rawat Inap'] = resepRanap;
          flat['Resep IGD'] = resepIgd;
          flat['Total Lembar Resep'] = totalResep;
          flat['Kesalahan Rawat Jalan'] = salahRajal;
          flat['Kesalahan Rawat Inap'] = salahRanap;
          flat['Kesalahan IGD'] = salahIgd;
          flat['Total Kesalahan Kejadian'] = totalSalah;
          hasilVal = `${persen}%`;
        } else if (cfg.table === 'simrsResponseTimeIt') {
          const rt = r.response_time_menit || 0;
          hasilVal = `${rt} Menit`;
        } else if (cfg.table === 'mutuRekamMedis') {
          const t = cfg.extraWhere?.tipe;
          delete flat['Periode Id'];
          delete flat['Created By'];
          delete flat['Created At'];
          delete flat['Updated At'];
          
          let num = 0, den = 0, pct = 0;
          if (t === 'kelengkapan_ranap') {
            num = r.kelengkapan_ranap_num || 0;
            den = r.kelengkapan_ranap_den || 0;
            pct = r.kelengkapan_ranap_pct || 0;
          } else if (t === 'pengembalian_rm') {
            num = r.pengembalian_num || 0;
            den = r.pengembalian_den || 0;
            pct = r.pengembalian_pct || 0;
          } else if (t === 'antrian_online') {
            num = r.antrian_online_num || 0;
            den = r.antrian_online_den || 0;
            pct = r.antrian_online_pct || 0;
          } else if (t === 'ketepatan_coding') {
            num = r.coding_num || 0;
            den = r.coding_den || 0;
            pct = r.coding_pct || 0;
          } else if (t === 'mobile_jkn') {
            num = r.mobile_jkn_num || 0;
            den = r.mobile_jkn_den || 0;
            pct = r.mobile_jkn_pct || 0;
          }

          flat['Numerator (N)'] = num;
          flat['Denominator (D)'] = den;
          hasilVal = `${pct}%`;
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
