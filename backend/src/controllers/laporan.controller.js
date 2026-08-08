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
  'Insiden Pasien Jatuh HD': { service: require('../services/modules/insiden-pasien-jatuh-hd.service'), table: 'insidenPasienJatuhHd', category: 'Hemodialisa' },
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
  'Kelengkapan Laporan Anestesi Sedasi': { service: require('../services/modules/mutu-kamar-operasi.service'), table: 'mutuKamarOperasi', category: 'Operasi & Anestesi', extraWhere: { tipe: 'laporan_anestesi' } },

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
  
  // Pelayanan
  'Kepuasan Pasien Pada Pelayanan': { service: require('../services/modules/kepuasan-pasien-pelayanan.service'), table: 'kepuasanPasienPelayanan', category: 'Pelayanan' },
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
        else if (name.includes('Kematian') || name === 'Insiden Keselamatan') {
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

// Download official template excel format matching database schema for all registered indicators
async function downloadTemplate(req, res, next) {
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Instructions
    const instructions = [
      { 'PETUNJUK PENGISIAN TEMPLATE IMPORT SIMURS': '1. Jangan mengubah nama sheet dan nama kolom pada header baris pertama.' },
      { 'PETUNJUK PENGISIAN TEMPLATE IMPORT SIMURS': '2. Format Tanggal wajib: YYYY-MM-DD (contoh: 2026-08-01).' },
      { 'PETUNJUK PENGISIAN TEMPLATE IMPORT SIMURS': '3. Kolom Pilihan / Checklist diisi "dilakukan" atau "tidak dilakukan" / "Ya" atau "Tidak".' },
      { 'PETUNJUK PENGISIAN TEMPLATE IMPORT SIMURS': '4. Hapus baris contoh sebelum mengunggah file yang sudah diisi.' },
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'PETUNJUK_PENGISIAN');

    const templateDefinitions = [
      {
        name: 'Risiko Jatuh',
        sample: [{ 'Nama Pasien': 'Budi Santoso', 'No RM': 'RM-100234', 'Usia': 45, 'Asesmen Awal': 'dilakukan', 'Asesmen Ulang': 'dilakukan', 'Intervensi': 'dilakukan', 'Edukasi': 'dilakukan' }]
      },
      {
        name: 'Insiden Keselamatan',
        sample: [{ 'Tanggal Kejadian': '2026-08-01', 'Jam Kejadian': '10:30', 'Nama Pasien': 'Siti Aminah', 'No RM': 'RM-100235', 'Deskripsi Insiden': 'Pasien hampir terpeleset', 'Jenis Insiden': 'KNC' }]
      },
      {
        name: 'Identifikasi Pasien',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Ahmad Fauzi', 'No RM': 'RM-100236', 'Pemberian Obat': 'dilakukan', 'Nutrisi NGT': 'dilakukan', 'Pemberian Darah': 'dilakukan', 'Tindakan Keperawatan': 'dilakukan' }]
      },
      {
        name: 'Reaksi Transfusi',
        sample: [{ 'Nama Pasien': 'Rina Wijaya', 'No RM': 'RM-100237', 'Ada Reaksi': 'Tidak', 'Jumlah Permintaan Kolf': 2, 'Darah Masuk Kolf': 2, 'Keterangan': 'Lancar' }]
      },
      {
        name: 'Gelang Identitas',
        sample: [{ 'Nama Pasien': 'Dewi Lestari', 'No RM': 'RM-100238', 'Gelang Identitas': 'dilakukan', 'Alergi': 'dilakukan', 'Fall Risk': 'dilakukan', 'Dnr': 'dilakukan', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Serah Terima Pasien',
        sample: [{ 'Nama Pasien': 'Hendra Setiawan', 'No RM': 'RM-100239', 'Akun': 'Sesuai', 'Keluhan': 'Sesuai', 'Ttv': 'Sesuai', 'Penunjang': 'Sesuai', 'Konsul': 'Sesuai', 'Tindakan': 'Sesuai', 'Obat': 'Sesuai', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Angka Kematian Ranap',
        sample: [{ 'Nama Pasien': 'Sudirman', 'No RM': 'RM-100240', 'Tanggal Masuk': '2026-08-01', 'Jam Masuk': '08:00', 'Tanggal Keluar': '2026-08-03', 'Jam Keluar': '14:00', 'Keterangan': 'Meninggal > 48 jam' }]
      },
      {
        name: 'Double Check High Alert',
        sample: [{ 'Nama Pasien': 'Nurul Hidayah', 'No RM': 'RM-100241', 'Diagnosis': 'Diabetes Mellitus', 'Nama Obat': 'Insulin', 'Nama Penyerah': 'Suster Bambang', 'Nama Penerima': 'Suster Ana', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Visit Dokter Spesialis',
        sample: [{ 'Nama Dpjp': 'dr. Sp.PD', 'Nama Pasien': 'Joko Widodo', 'No RM': 'RM-100242', 'Jam Mulai Selesai': '09:00 - 11:00', 'Jam Visit': '09:30', 'Kategori Visit': 'sesuai_jam' }]
      },
      {
        name: 'Kembali ICU < 72 Jam',
        sample: [{ 'Nama Pasien': 'Bambang Tri', 'No RM': 'RM-100243', 'Diagnosis': 'Gagal Napas', 'Dpjp': 'dr. Sp.An', 'Keterangan': 'Penyebab perburukan' }]
      },
      {
        name: 'Alur Klinis',
        sample: [{ 'Nama Pasien': 'Siti Rahma', 'No RM': 'RM-100244', 'Diagnosis': 'DHF', 'Ruangan': 'Mawar 01', 'Bulan': 'Agustus', 'Los': 'sesuai', 'Penunjang': 'sesuai', 'Obat': 'sesuai' }]
      },
      {
        name: 'Waktu Tanggap SC',
        sample: [{ 'Nama Pasien': 'Eka Putri', 'No RM': 'RM-100245', 'Diagnosis': 'GDM', 'Jam Ditentukan Operasi': '13:00', 'Jam Sayatan Pertama': '13:25', 'Selisih Menit': 25 }]
      },
      {
        name: 'Emergency Response Time',
        sample: [{ 'Nama Pasien': 'Fajar Nugraha', 'No RM': 'RM-100246', 'Jam Datang': '10:00', 'Jam Dilayani Dokter': '10:04', 'Respon Time Menit': 4, 'Triase': 'P1' }]
      },
      {
        name: 'Asesmen Awal IGD',
        sample: [{ 'Nama Pasien': 'Gita Gutawa', 'No RM': 'RM-100247', 'Anamnesis': 'ada', 'Ttv': 'ada', 'Tb': 'ada', 'Bb': 'ada', 'Diagnosis': 'ada', 'Terapi': 'ada' }]
      },
      {
        name: 'Pasien Tertahan IGD',
        sample: [{ 'Nama Pasien': 'Hadi Sucipto', 'No RM': 'RM-100248', 'Jam Masuk': '08:00', 'Jam Pindah Ruangan': '11:30', 'Waktu Tunggu Menit': 210, 'Keterangan': 'Ruangan Penuh' }]
      },
      {
        name: 'Ketidakpatuhan Pasien HD',
        sample: [{ 'Nama Pasien': 'Iwan Fals', 'No RM': 'RM-100249', 'Jadwal Hd Per Minggu': '2x Seminggu', 'Hari Tidak Datang': 'Rabu', 'Alasan': 'Sakit Kepala' }]
      },
      {
        name: 'Insiden Clotting Durante HD',
        sample: [{ 'Tanggal Kejadian': '2026-08-01', 'Nama Pasien': 'Joko Susilo', 'No RM': 'RM-100250', 'Deskripsi Insiden': 'Clotting pada dialiser', 'Pemberian Antiplatelet': 'Heparin 5000 IU' }]
      },
      {
        name: 'Insiden Pasien Jatuh HD',
        sample: [{ 'Tanggal Kejadian': '2026-08-01', 'Nama Pasien': 'Kartika Sari', 'No RM': 'RM-100251', 'Deskripsi Kejadian': 'Terpeleset saat turun dari tempat tidur' }]
      },
      {
        name: 'Insiden Jarum Vena HD',
        sample: [{ 'Tanggal Kejadian': '2026-08-01', 'Nama Pasien': 'Lukman Hakim', 'No RM': 'RM-100252', 'Perawat Pemasang': 'Br. Dedi', 'Penyebab': 'Vena rapuh' }]
      },
      {
        name: 'Penundaan Operasi Elektif',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Mega Wati', 'No RM': 'RM-100253', 'Dpjp': 'dr. Sp.B', 'Jadwal Jam Operasi': '09:00', 'Jam Mulai Operasi': '09:45', 'Waktu Tunggu Menit': 45, 'Batal': 'Tidak', 'Indikasi Medis': 'Tidak' }]
      },
      {
        name: 'Informed Consent Bedah',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Nanda Restu', 'No RM': 'RM-100254', 'Dpjp': 'dr. Sp.B', 'Diisi': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Informed Consent Anestesi',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Oki Setiana', 'No RM': 'RM-100255', 'Dpjp': 'dr. Sp.An', 'Diisi': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Asesmen Pra Bedah',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Putri Titian', 'No RM': 'RM-100256', 'Dpjp': 'dr. Sp.B', 'Diisi': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Asesmen Pra Anestesi',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Qori Sandioriva', 'No RM': 'RM-100257', 'Dpjp': 'dr. Sp.An', 'Diisi': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Surgical Safety Checklist Op',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Raditya Dika', 'No RM': 'RM-100258', 'Dpjp': 'dr. Sp.B', 'Sign In': 'Ya', 'Time Out': 'Ya', 'Sign Out': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Penandaan Lokasi Operasi',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Syaiful Jamil', 'No RM': 'RM-100259', 'Diagnosis': 'Appendicitis', 'Dpjp': 'dr. Sp.B', 'Dilakukan': 'Ya', 'Not Applicable': 'Tidak', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Ketepatan Waktu Makanan',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Titi Kamal', 'No RM': 'RM-100260', 'Tepat Waktu': 'Ya', 'Keterangan': 'Sesuai jam makan' }]
      },
      {
        name: 'Sisa Makanan Pasien',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Ussy Sulistiawaty', 'No RM': 'RM-100261', 'Sisa Makanan Pct': 10, 'Keterangan': '< 20%' }]
      },
      {
        name: 'Akurasi Pemberian Diet',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Vino G Bastian', 'No RM': 'RM-100262', 'Sesuai Diet': 'Ya', 'Keterangan': 'Diet Rendah Garam' }]
      },
      {
        name: 'Identifikasi Pasien SIMRS',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Wulan Guritno', 'No RM': 'RM-100263', 'Sesuai Identifikasi': 'Ya', 'Keterangan': 'Lengkap' }]
      },
      {
        name: 'Response Time SIMRS IT',
        sample: [{ 'Tanggal': '2026-08-01', 'Unit Pemohon': 'Rawat Inap Mawar', 'Kategori Komplain': 'Printer E-Resep Jammed', 'Response Time Menit': 12, 'Keterangan': 'Selesai cepat' }]
      },
      {
        name: 'Kepuasan Pasien Pada Pelayanan',
        sample: [{ 'Tanggal': '2026-08-01', 'Total Pasien': 100, 'Rata Rata Penilaian': 85.5, 'Keterangan': 'Survei Bulanan' }]
      }
    ];

    for (const item of templateDefinitions) {
      const sheetName = item.name.substring(0, 30);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(item.sample), sheetName);
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_SIMURS.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);

  } catch (err) {
    next(err);
  }
}

// Safe value parser & cleaner for import engine
function parseDateOrTimeValue(val, isTimeOnly = false) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val;
  }
  const str = String(val).trim();
  if (isTimeOnly) {
    const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      return new Date(1970, 0, 1, parseInt(match[1]), parseInt(match[2]), parseInt(match[3] || '0'));
    }
  }
  const parsed = new Date(str);
  return !isNaN(parsed.getTime()) ? parsed : null;
}

function cleanValueForDb(key, val) {
  if (val === undefined || val === null) return undefined;

  const ignoredKeys = [
    'no', 'hasil', 'total_data', 'target', 'pencapaian', 'status',
    'numerator_(n)', 'denominator_(d)', 'total_lembar_resep', 'total_kesalahan_kejadian',
    'total_obat_(d)', 'total_double_check_(n)', 'tidak_double_check',
    'total_tidak_tersedia_(n)', 'total_obat_racikan', 'total_tunggu_racikan_<=_60_menit',
    'total_obat_non_racikan', 'total_tunggu_non_racikan_<=_30_menit'
  ];
  if (ignoredKeys.includes(key.toLowerCase())) return undefined;

  if (['usia', 'selisih_menit', 'waktu_tunggu_menit', 'respon_time_menit', 'response_time_menit', 'over_exposure', 'under_exposure', 'positioning', 'artefac', 'equitmen', 'jumlah_pasien', 'jumlah_pemeriksaan', 'jumlah_kepatuhan', 'jumlah_kesalahan', 'jumlah_kerusakan', 'ekspertisi_dokter', 'jumlah_permintaan_kolf', 'darah_masuk_kolf', 'sisa_makanan_pct'].includes(key)) {
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  if (['jam_kejadian', 'jam_masuk', 'jam_keluar', 'jam_datang', 'jam_dilayani_dokter', 'jam_ditentukan_operasi', 'jam_sayatan_pertama', 'jadwal_jam_operasi', 'jam_mulai_operasi', 'jam_pindah_ruangan', 'jam_visit'].includes(key)) {
    return parseDateOrTimeValue(val, true);
  }

  if (['tanggal', 'tanggal_kejadian', 'tanggal_masuk', 'tanggal_keluar', 'tanggal_penjadwalan', 'tanggal_operasi'].includes(key)) {
    return parseDateOrTimeValue(val, false) || new Date();
  }

  if (typeof val === 'string') {
    const cleanStr = val.toLowerCase().trim();

    if (['asesmen_awal', 'asesmen_ulang', 'intervensi', 'edukasi', 'gelang_identitas', 'alergi', 'fall_risk', 'dnr'].includes(key)) {
      if (['dilakukan', 'ya', 'true', '1', 'sesuai'].includes(cleanStr)) return 'dilakukan';
      return 'tidak dilakukan';
    }

    if (['pemberian_obat', 'nutrisi_ngt', 'pemberian_darah', 'tindakan_keperawatan', 'pengambilan_spesimen', 'melakukan_tindakan'].includes(key)) {
      if (cleanStr.includes('peluang')) return 'tidak ada peluang';
      if (['dilakukan', 'ya', 'true', '1', 'sesuai'].includes(cleanStr)) return 'dilakukan';
      return 'tidak dilakukan';
    }

    if (['los', 'penunjang', 'obat', 'sesuai_diet', 'sesuai_identifikasi'].includes(key)) {
      if (['sesuai', 'ya', 'true', '1', 'dilakukan'].includes(cleanStr)) return 'sesuai';
      return 'tidak sesuai';
    }

    if (['akun', 'keluhan', 'ttv', 'konsul', 'tindakan'].includes(key)) {
      if (['sesuai', 'ya', 'true', '1', 'dilakukan'].includes(cleanStr)) return 'Sesuai';
      return 'Tidak Sesuai';
    }

    if (['anamnesis', 'tb', 'bb', 'diagnosis', 'terapi'].includes(key)) {
      if (['ada', 'ya', 'true', '1'].includes(cleanStr)) return 'ada';
      return 'tidak ada';
    }

    if (['ada_reaksi', 'diisi', 'sign_in', 'time_out', 'sign_out', 'dilakukan', 'batal', 'indikasi_medis', 'not_applicable', 'tepat_waktu', 'penggunaan_apd', 'moment_1', 'moment_2', 'moment_3', 'moment_4', 'moment_5'].includes(key)) {
      if (['ya', 'true', '1', 'dilakukan', 'sesuai'].includes(cleanStr)) return true;
      if (['tidak', 'false', '0', 'tidak dilakukan', 'tidak sesuai'].includes(cleanStr)) return false;
    }
  }

  return val;
}

// Importer function with strict validation matching database structure
async function importExcel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File Excel tidak ditemukan' });
    }

    const wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Get active period
    let activePeriode = await prisma.periode.findFirst({ where: { status: 'open' }, orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }] });
    if (!activePeriode) {
      return res.status(403).json({ success: false, message: 'Tidak ada periode terbuka (open) yang tersedia. Periode telah dikunci.' });
    }

    if (activePeriode.status === 'closed') {
      return res.status(403).json({ success: false, message: 'Periode aktif ini telah dikunci (closed). Data tidak dapat diimpor.' });
    }

    for (const sheetName of wb.SheetNames) {
      if (['PETUNJUK_PENGISIAN', 'Ringkasan Mutu'].includes(sheetName)) continue;

      // Match sheet name with services (up to 30 chars)
      const match = Object.entries(services).find(([name]) => {
        const exportedSheetName = name.substring(0, 30).toLowerCase();
        return sheetName.toLowerCase().trim() === exportedSheetName.trim();
      });

      if (!match) {
        errors.push(`Sheet "${sheetName}" diabaikan (tidak cocok dengan nama indikator yang terdaftar).`);
        continue;
      }

      const [name, cfg] = match;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws);

      let rowIdx = 1;
      for (const row of rows) {
        rowIdx++;

        // Basic check: must have at least one identifier field
        if (!row['Nama Pasien'] && !row['No RM'] && !row['Tanggal'] && !row['Tanggal Kejadian'] && !row['Nama Petugas'] && !row['Nama Perawat']) {
          skippedCount++;
          continue;
        }

        const payload = {
          periode_id: activePeriode.id,
          created_by: req.user.id,
        };

        if (!cfg.service.ignoreUnitId) {
          payload.unit_id = req.user.unit_id || 1;
        }

        for (const [rowKey, rowVal] of Object.entries(row)) {
          const dbKey = rowKey.toLowerCase().replace(/ /g, '_');
          const cleanVal = cleanValueForDb(dbKey, rowVal);

          if (cleanVal !== undefined) {
            payload[dbKey] = cleanVal;
          }
        }

        if (cfg.extraWhere) {
          Object.assign(payload, cfg.extraWhere);
        }

        for (const key in payload) {
          if (payload[key] === undefined) delete payload[key];
        }

        try {
          await prisma[cfg.table].create({ data: payload });
          importedCount++;
        } catch (err) {
          skippedCount++;
          errors.push(`Gagal mengimpor baris ${rowIdx} pada sheet "${sheetName}": ${err.message}`);
        }
      }
    }

    let msg = `Berhasil mengimpor ${importedCount} record data ke periode aktif.`;
    if (skippedCount > 0) {
      msg += ` (${skippedCount} baris dilewati/gagal diproses).`;
    }

    res.json({
      success: true,
      message: msg,
      importedCount,
      skippedCount,
      errors: errors.slice(0, 10)
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { exportExcel, importExcel, downloadTemplate };
