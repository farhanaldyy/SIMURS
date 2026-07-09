const prisma = require('../config/database');

async function getSummary(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    const where = {};
    if (periode_id) where.periode_id = parseInt(periode_id);
    if (unit_id) where.unit_id = parseInt(unit_id);

    // Gather counts from each indicator table
    const [
      risikoJatuh, insidenKeselamatan, reaksiTransfusi, angkaKematian,
      doubleCheck, waktuTanggap, identifikasi, alurKlinis,
      visitDokter, ert, asesmenIgd, pasienTertahan,
      gelangIdentitas, serahTerima, kembaliIcu, ketidakpatuhanHd,
      insidenClotting, insidenJarum, penundaanOperasi,
      informedConsent, asesmenPra, surgicalChecklist, penandaanLokasi,
      mutuKamarOperasi, giziWaktuMakanan, giziSisaMakanan,
      giziKesalahanDiet, giziIdentifikasiPasien, kepatuhanKebersihanTangan, kepatuhanApd,
      waktuTungguPoliklinik, waktuTungguOperasi
    ] = await Promise.all([
      prisma.risikoJatuh.count({ where }),
      prisma.insidenKeselamatan.count({ where }),
      prisma.reaksiTransfusi.count({ where }),
      prisma.angkaKematian.count({ where }),
      prisma.doubleCheckHighAlert.count({ where }),
      prisma.waktuTanggapSc.count({ where }),
      prisma.identifikasiPasien.count({ where }),
      prisma.alurKlinis.count({ where }),
      prisma.visitDokter.count({ where }),
      prisma.emergencyResponseTime.count({ where }),
      prisma.asesmenAwalIgd.count({ where }),
      prisma.pasienTertahanIgd.count({ where }),
      prisma.gelangIdentitas.count({ where }),
      prisma.serahTerimaPasien.count({ where }),
      prisma.kembaliIcu.count({ where: { periode_id: where.periode_id } }),
      prisma.ketidakpatuhanHd.count({ where: { periode_id: where.periode_id } }),
      prisma.insidenClotting.count({ where: { periode_id: where.periode_id } }),
      prisma.insidenJarumVena.count({ where: { periode_id: where.periode_id } }),
      prisma.penundaanOperasi.count({ where: { periode_id: where.periode_id } }),
      prisma.informedConsent.count({ where }),
      prisma.asesmenPraOperasi.count({ where }),
      prisma.surgicalChecklist.count({ where }),
      prisma.penandaanLokasiOperasi.count({ where: { periode_id: where.periode_id } }),
      prisma.mutuKamarOperasi.count({ where: { periode_id: where.periode_id } }),
      prisma.giziWaktuMakanan.count({ where }),
      prisma.giziSisaMakanan.count({ where }),
      prisma.giziKesalahanDiet.count({ where }),
      prisma.giziIdentifikasiPasien.count({ where }),
      prisma.kepatuhanKebersihanTangan.count({ where }),
      prisma.kepatuhanApd.count({ where }),
      prisma.waktuTungguPoliklinik.count({ where }),
      prisma.waktuTungguOperasi.count({ where }),
      prisma.mutuRekamMedis.count({ where: { periode_id: where.periode_id } }),
      prisma.rehabPasienDropOut.count({ where }),
      prisma.rehabKesalahanTindakan.count({ where }),
      prisma.rehabWaktuTunggu.count({ where }),
      prisma.rehabKepatuhanIdentitas.count({ where }),
      prisma.rehabKepuasanPasien.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        totalRecords: {
          risikoJatuh, insidenKeselamatan, reaksiTransfusi, angkaKematian,
          doubleCheck, waktuTanggap, identifikasi, alurKlinis,
          visitDokter, ert, asesmenIgd, pasienTertahan,
          gelangIdentitas, serahTerima, kembaliIcu, ketidakpatuhanHd,
          insidenClotting, insidenJarum, penundaanOperasi,
          informedConsent, asesmenPra, surgicalChecklist, penandaanLokasi,
          mutuKamarOperasi, giziWaktuMakanan, giziSisaMakanan,
          giziKesalahanDiet, giziIdentifikasiPasien, kepatuhanKebersihanTangan, kepatuhanApd,
          waktuTungguPoliklinik, waktuTungguOperasi, mutuRekamMedis,
          rehabPasienDropOut, rehabKesalahanTindakan, rehabWaktuTunggu, rehabKepatuhanIdentitas, rehabKepuasanPasien
        },
      },
    });
  } catch (err) { next(err); }
}

const services = {
  'Risiko Jatuh': { service: require('../services/modules/risiko-jatuh.service'), category: 'Keselamatan Pasien' },
  'Insiden Keselamatan': { service: require('../services/modules/insiden-keselamatan.service'), category: 'Keselamatan Pasien' },
  'Identifikasi Pasien': { service: require('../services/modules/identifikasi-pasien.service'), category: 'Keselamatan Pasien' },
  'Reaksi Transfusi': { service: require('../services/modules/reaksi-transfusi.service'), category: 'Keselamatan Pasien' },
  'Gelang Identitas': { service: require('../services/modules/gelang-identitas.service'), category: 'Keselamatan Pasien' },
  'Serah Terima Pasien': { service: require('../services/modules/serah-terima-pasien.service'), category: 'Keselamatan Pasien' },
  'Kepatuhan Kebersihan Tangan': { service: require('../services/modules/kepatuhan-kebersihan-tangan.service'), category: 'Keselamatan Pasien' },
  'Kepatuhan Penggunaan APD': { service: require('../services/modules/kepatuhan-apd.service'), category: 'Keselamatan Pasien' },
  
  'Angka Kematian Ranap': { service: require('../services/modules/angka-kematian-ranap.service'), category: 'Rawat Inap', extraWhere: { lokasi: 'ranap' } },
  'Double Check High Alert': { service: require('../services/modules/double-check-high-alert.service'), category: 'Rawat Inap' },
  'Visit Dokter Spesialis': { service: require('../services/modules/visit-dokter.service'), category: 'Rawat Inap' },
  'Kembali ICU < 72 Jam': { service: require('../services/modules/kembali-icu.service'), category: 'Rawat Inap' },
  'Alur Klinis': { service: require('../services/modules/alur-klinis.service'), category: 'Rawat Inap' },
  
  'Waktu Tanggap SC': { service: require('../services/modules/waktu-tanggap-sc.service'), category: 'IGD' },
  'Emergency Response Time': { service: require('../services/modules/emergency-response-time.service'), category: 'IGD' },
  'Angka Kematian IGD': { service: require('../services/modules/angka-kematian-igd.service'), category: 'IGD', extraWhere: { lokasi: 'igd' } },
  'Asesmen Awal IGD': { service: require('../services/modules/asesmen-awal-igd.service'), category: 'IGD' },
  'Pasien Tertahan IGD': { service: require('../services/modules/pasien-tertahan-igd.service'), category: 'IGD' },
  
  'Ketidakpatuhan Pasien HD': { service: require('../services/modules/ketidakpatuhan-hd.service'), category: 'Hemodialisa' },
  'Insiden Clotting Durante HD': { service: require('../services/modules/insiden-clotting.service'), category: 'Hemodialisa' },
  'Insiden Jarum Vena HD': { service: require('../services/modules/insiden-jarum-vena.service'), category: 'Hemodialisa' },
  
  'Penundaan Operasi Elektif': { service: require('../services/modules/penundaan-operasi.service'), category: 'Operasi & Anestesi' },
  'Informed Consent Bedah': { service: require('../services/modules/informed-consent-pembedahan.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'pembedahan' } },
  'Informed Consent Anestesi': { service: require('../services/modules/informed-consent-anestesi.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'anestesi' } },
  'Asesmen Pra Bedah': { service: require('../services/modules/asesmen-pra-bedah.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'pra_bedah' } },
  'Asesmen Pra Anestesi': { service: require('../services/modules/asesmen-pra-anestesi.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'pra_anestesi' } },
  'Surgical Safety Checklist SC': { service: require('../services/modules/surgical-checklist-sc.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'sc' } },
  'Surgical Safety Checklist Op': { service: require('../services/modules/surgical-checklist-operasi.service'), category: 'Operasi & Anestesi', extraWhere: { jenis: 'operasi_umum' } },
  'Penandaan Lokasi Operasi': { service: require('../services/modules/penandaan-lokasi-operasi.service'), category: 'Operasi & Anestesi' },
  'Kejadian Kematian di Meja Operasi': { service: require('../services/modules/mutu-kamar-operasi.service'), category: 'Operasi & Anestesi', extraWhere: { tipe: 'kematian_meja_operasi' } },
  'Kejadian Operasi Salah Sisi': { service: require('../services/modules/mutu-kamar-operasi.service'), category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_sisi' } },
  'Kejadian Operasi Salah Orang': { service: require('../services/modules/mutu-kamar-operasi.service'), category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_orang' } },
  'Kejadian Operasi Salah Prosedur / Tindakan': { service: require('../services/modules/mutu-kamar-operasi.service'), category: 'Operasi & Anestesi', extraWhere: { tipe: 'salah_prosedur' } },

  // Gizi
  'Ketepatan Waktu Makanan': { service: require('../services/modules/gizi-waktu-makanan.service'), category: 'Gizi' },
  'Sisa Makanan Pasien': { service: require('../services/modules/gizi-sisa-makanan.service'), category: 'Gizi' },
  'Akurasi Pemberian Diet': { service: require('../services/modules/gizi-kesalahan-diet.service'), category: 'Gizi' },
  'Identifikasi Pasien SIMRS': { service: require('../services/modules/gizi-identifikasi-pasien.service'), category: 'Gizi' },

  // Rawat Jalan
  'Waktu Tunggu Poliklinik': { service: require('../services/modules/waktu-tunggu-poliklinik.service'), category: 'Rawat Jalan' },
  'Waktu Tunggu Operasi Elektif': { service: require('../services/modules/waktu-tunggu-operasi.service'), category: 'Rawat Jalan' },

  // Rekam Medis
  'Kelengkapan Dokumen Rekam Medis Pasien Ranap': { service: require('../services/modules/mutu-rekam-medis.service'), category: 'Rekam Medis', extraWhere: { tipe: 'kelengkapan_ranap' } },
  'Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam': { service: require('../services/modules/mutu-rekam-medis.service'), category: 'Rekam Medis', extraWhere: { tipe: 'pengembalian_rm' } },
  'Pemberian Informasi Antrian Online': { service: require('../services/modules/mutu-rekam-medis.service'), category: 'Rekam Medis', extraWhere: { tipe: 'antrian_online' } },
  'Ketepatan Coding Rawat Inap & Rawat Jalan': { service: require('../services/modules/mutu-rekam-medis.service'), category: 'Rekam Medis', extraWhere: { tipe: 'ketepatan_coding' } },
  'Antrian Mobile JKN': { service: require('../services/modules/mutu-rekam-medis.service'), category: 'Rekam Medis', extraWhere: { tipe: 'mobile_jkn' } },

  // Rehabilitasi Medis
  'Kejadian drop out pasien terhadap pelayanan rehabilitasi medik yang direncanakan': { service: require('../services/modules/rehab-drop-out.service'), category: 'Rehabilitasi Medis' },
  'Tidak adanya kejadian kesalahan tindakan rehabilitasi medik': { service: require('../services/modules/rehab-kesalahan-tindakan.service'), category: 'Rehabilitasi Medis' },
  'Waktu tunggu pelayanan rawat jalan rehabilitasi medik': { service: require('../services/modules/rehab-waktu-tunggu.service'), category: 'Rehabilitasi Medis' },
  'Kepatuhan identitas pasien': { service: require('../services/modules/rehab-kepatuhan-identitas.service'), category: 'Rehabilitasi Medis' },
  'Kepuasan pasien dengan pelayanan rehabilitasi medik': { service: require('../services/modules/rehab-kepuasan-pasien.service'), category: 'Rehabilitasi Medis' },
};

async function getIndicatorSummaries(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    const queryWhere = {};
    if (periode_id) queryWhere.periode_id = parseInt(periode_id);
    if (unit_id) queryWhere.unit_id = parseInt(unit_id);

    const summaries = {};
    for (const [name, cfg] of Object.entries(services)) {
      const sw = { ...queryWhere, ...cfg.extraWhere };
      if (cfg.service.ignoreUnitId) delete sw.unit_id;
      
      const sum = await cfg.service.getSummary(sw);
      summaries[name] = {
        ...sum,
        category: cfg.category
      };
    }

    res.json({ success: true, data: summaries });
  } catch (err) { next(err); }
}

module.exports = { getSummary, getIndicatorSummaries };
