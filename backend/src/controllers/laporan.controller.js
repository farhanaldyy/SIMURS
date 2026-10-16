const prisma = require('../config/database');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');

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
  'Jadwal Dokter Radiologi': { service: require('../services/modules/radiologi-jadwal-dokter.service'), table: 'radiologiJadwalDokter', category: 'Radiologi' },
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
  'Tidak Adanya Kesalahan Penyerahan Hasil Lab': { service: require('../services/modules/laboratorium-kesalahan-penyerahan.service'), table: 'laboratoriumKesalahanPenyerahan', category: 'Laboratorium' },

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
  'Kecepatan Waktu Tanggap Komplain': { service: require('../services/modules/waktu-tanggap-komplain.service'), table: 'waktuTanggapKomplain', category: 'Kepuasan Pasien' },
};

const SERVICE_TO_INDICATOR_IDS = {
  'Risiko Jatuh': ['risiko_jatuh'],
  'Insiden Keselamatan': ['insiden_keselamatan'],
  'Identifikasi Pasien': ['identifikasi_pasien'],
  'Reaksi Transfusi': ['reaksi_transfusi'],
  'Gelang Identitas': ['gelang_identitas'],
  'Serah Terima Pasien': ['serah_terima_pasien'],
  'Kepatuhan Kebersihan Tangan': ['kepatuhan_kebersihan_tangan'],
  'Kepatuhan Penggunaan APD': ['kepatuhan_apd'],

  'Angka Kematian Ranap': ['angka_kematian_ranap'],
  'Double Check High Alert': ['double_check_high_alert'],
  'Visit Dokter Spesialis': ['visit_dokter'],
  'Kembali ICU < 72 Jam': ['kembali-icu'],
  'Alur Klinis': ['alur_klinis'],

  'Waktu Tanggap SC': ['waktu-tanggap-sc'],
  'Emergency Response Time': ['emergency_response_time'],
  'Angka Kematian IGD': ['angka_kematian_igd'],
  'Asesmen Awal IGD': ['asesmen_awal_igd'],
  'Pasien Tertahan IGD': ['pasien_tertahan_igd'],

  'Ketidakpatuhan Pasien HD': ['jadwal-hemodialisa'],
  'Insiden Clotting Durante HD': ['insiden-clotting-durante'],
  'Insiden Pasien Jatuh HD': ['insiden-pasien-jatuh-hd'],
  'Insiden Jarum Vena HD': ['insiden-jarum-vena'],

  'Penundaan Operasi Elektif': ['penundaan_operasi_elektif'],
  'Informed Consent Bedah': ['informed_consent_pembedahaan'],
  'Informed Consent Anestesi': ['kelengkapan_ic_anestesi'],
  'Asesmen Pra Bedah': ['asesmen_pra_bedah'],
  'Asesmen Pra Anestesi': ['asesmen_pra_anestesi'],
  'Surgical Safety Checklist SC': ['surgical_checklist_sc'],
  'Surgical Safety Checklist Op': ['surgical_checklist_operasi'],
  'Penandaan Lokasi Operasi': ['penandaan_lokasi_operasi'],
  'Kejadian Kematian di Meja Operasi': ['kematian_meja_operasi'],
  'Kejadian Operasi Salah Sisi': ['salah_sisi_operasi'],
  'Kejadian Operasi Salah Orang': ['operasi_salah_pasien'],
  'Kejadian Operasi Salah Prosedur / Tindakan': ['operasi_salah_prosedur'],
  'Kelengkapan Laporan Anestesi Sedasi': ['kelengkapan_laporan_anestesi'],

  'Kepatuhan Pelaksanaan Double Check Obat High Alert': ['double-check-obat-farmasi'],
  'Ketidaktersediaan Obat di Farmasi di Rawat Jalan': ['tidaktersedia-obat-rawat-jalan'],
  'Ketidaktersediaan Obat di Farmasi di Rawat Inap': ['tidaktersedia-obat-rawat-inap'],
  'Waktu Tunggu Obat Racikan dan Non Racikan': ['tunggu-obat-racik', 'tunggu-obat-nonracik'],
  'Rata Rata Menut waktu tunggu': ['rata-tunggu-racikan', 'rata-tunggu-nonracikan'],
  'Kesalahan Penyerahan Obat Kepada Pasien': ['salah-obat-rajal', 'salah-obat-ranap', 'salah-obat-igd', 'total-salah-obat'],
  'Kepatuhan penggunaan formularium nasional': ['kepatuhan-formula-nasional'],

  'Ketepatan Waktu Makanan': ['waktu-gizi-pasien'],
  'Sisa Makanan Pasien': ['sisa-gizi-pasien'],
  'Akurasi Pemberian Diet': ['salah-gizi-diet'],
  'Identifikasi Pasien SIMRS': ['simrs-gizi-identifikasi'],

  'Waktu Tunggu Poliklinik': ['waktu_tunggu_poliklinik', 'waktu_tunggu_poliklinik_jam', 'waktu_tunggu_poliklinik_kepatuhan', 'waktu_tunggu_poliklinik_rata_rata'],
  'Waktu Tunggu Operasi Elektif': ['penundaan_operasi_elektif'],

  'Kejadian drop out pasien terhadap pelayanan rehabilitasi medik yang direncanakan': ['rehab-drop-pasien'],
  'Tidak adanya kejadian kesalahan tindakan rehabilitasi medik': ['rehab-kesalahan-tindakan'],
  'Waktu tunggu pelayanan rawat jalan rehabilitasi medik': ['rehab-waktu-tunggu'],
  'Kepatuhan identitas pasien': ['rehab-identifikasi'],
  'Kepuasan pasien dengan pelayanan rehabilitasi medik': ['rehab-drop-pasien', 'rehab-kesalahan-tindakan', 'rehab-waktu-tunggu', 'rehab-identifikasi'],

  'Ketepatan Waktu Penyediaan Linen Bersih': ['laundry-waktu-linen'],
  'Tidak Adanya Kejadian Linen Hilang': ['laundry-linen-hilang'],

  'Jadwal Dokter Radiologi': ['waktu-tunggu-sesuai-foto-thorax', 'waktu-tunggu-diluar-foto-thorax'],
  'Waktu tunggu hasil pelayanan foto thorax (Sesuai jadwal)': ['waktu-tunggu-sesuai-foto-thorax'],
  'Waktu tunggu hasil pelayanan foto thorax (Diluar jadwal)': ['waktu-tunggu-diluar-foto-thorax'],
  'Kejadian Foto Ulang Pasien': ['foto-ulang-pasien-radiologi'],
  'Kelengkapan pengisian form pemberian info tindakan radiologi': ['kelengkapan-form-radiologi'],
  'Kepatuhan Identifikasi Pasien (Radiologi)': ['kepatuhan-identifikasi-pasien-radiologi'],

  'Jadwal Dokter Laboratorium': ['waktu-tunggu-lab-kurangdari', 'waktu-tunggu-lab-lebihdari', 'dalam-menit-perpasien'],
  'Waktu tunggu hasil pemeriksaan laboratorium (< 140 Menit)': ['waktu-tunggu-lab-kurangdari', 'dalam-menit-perpasien'],
  'Waktu tunggu hasil pemeriksaan laboratorium (> 140 Menit)': ['waktu-tunggu-lab-lebihdari'],
  'Pelaporan hasil kritis laboratorium  ≤ 30 menit': ['hasil-kritis-lab'],
  'Tidak adanya kesalahan hasil input pemeriksaan lab': ['kesalahan-input-lab'],
  'Tidak adanya kerusakan sampel di laboratorium': ['kerusakan-sample-lab'],
  'Kepatuhan Identifikasi Pasien Laboratorium': ['kepatuhan-identifikasi-lab'],
  'Data Ekspertisi Oleh Dokter Laboratorium': ['ekpertisi-dokter-lab'],
  'Tidak Adanya Kesalahan Penyerahan Hasil Lab': ['kesalahan-penyerahan-hasil-lab'],

  'Response Time SIMRS IT': ['simrs-waktu-menanggapi'],

  'Kelengkapan Dokumen Rekam Medis Pasien Ranap': ['rm-dokumen'],
  'Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam': ['rm-pengisian-dok'],
  'Pemberian Informasi Antrian Online': ['rm-antrian-online'],
  'Ketepatan Coding Rawat Inap & Rawat Jalan': ['rm-coding-rwi-rwj'],
  'Antrian Mobile JKN': ['rm-jkn'],

  'Kepuasan Pasien Pada Pelayanan': ['kepuasan_pasien_pelayanan'],
  'Kecepatan Waktu Tanggap Komplain': ['waktu_tanggap_komplain'],
};

function detectUnitDepartment(unit) {
  if (!unit) return 'all';
  const code = (unit.kode_unit || '').toUpperCase().trim();
  const name = (unit.nama_unit || '').toUpperCase().trim();
  const kat = (unit.kategori_unit || '').toLowerCase().trim();

  if (code === 'FAR' || name.includes('FARMASI') || kat === 'farmasi') return 'farmasi';
  if (code === 'GIZI' || name.includes('GIZI') || kat === 'gizi') return 'gizi';
  if (code === 'RAD' || name.includes('RADIOLOGI') || kat === 'radiologi') return 'radiologi';
  if (code === 'LAB' || name.includes('LABORATORIUM') || kat === 'laboratorium') return 'laboratorium';
  if (code === 'RM' || code === 'PENDAFTARAN' || name.includes('REKAM MEDIS') || name.includes('PENDAFTARAN') || kat === 'rekam_medis') return 'rekam_medis';
  if (code === 'REHAB' || name.includes('REHAB') || kat === 'rehab_medis') return 'rehab_medis';
  if (code === 'LAUNDRY' || name.includes('LAUNDRY') || name.includes('LINEN') || name.includes('CSSD') || kat === 'laundry') return 'laundry';
  if (code === 'SIMRS' || code === 'IPSRS' || name.includes('SIMRS') || name.includes('IPSRS') || name.includes('IT ') || name === 'IT' || kat === 'simrs') return 'simrs';
  if (code === 'HD' || name.includes('HEMODIALIS')) return 'hemodialisa';
  if (code === 'OK' || name.includes('OPERASI') || name.includes('BEDAH') || name.includes('IBS')) return 'operasi';
  if (code === 'UGD' || code === 'IGD' || name.includes('GAWAT DARURAT') || name.includes('UGD') || name.includes('IGD') || kat === 'igd') return 'igd';
  if (code === 'RK_ICU' || name === 'ICU' || name.includes('INTENSIVE CARE')) return 'icu';
  if (code === 'RK_NICU' || name === 'NICU') return 'nicu';
  if (code.startsWith('KB_') || name.includes('ANNISA') || name.includes('PERINATOLOGI') || name.includes('VK') || name.includes('BERSALIN')) return 'kebidanan';
  if (code.startsWith('RJ_') || name.includes('POLI') || name.includes('RAWAT JALAN') || kat === 'rawat_jalan') return 'rawat_jalan';
  if (kat === 'unit_khusus') return 'unit_khusus';
  if (kat === 'penunjang') return 'penunjang';
  return 'rawat_inap';
}

function matchesUnitDepartmentDefault(name, cfg, dept) {
  // 1. Strict department ownership for tables without unit_id (ignoreUnitId: true)
  if (cfg.table === 'kembaliIcu') return dept === 'icu';
  if (cfg.category === 'Hemodialisa') return dept === 'hemodialisa';
  if (cfg.table === 'penundaanOperasi' || cfg.table === 'penandaanLokasiOperasi' || cfg.table === 'mutuKamarOperasi') {
    return dept === 'operasi';
  }
  if (cfg.category === 'Farmasi') return dept === 'farmasi';
  if (cfg.category === 'Rekam Medis') return dept === 'rekam_medis';

  // 2. Department-specific categories (with unit_id)
  if (cfg.category === 'Gizi') return dept === 'gizi';
  if (cfg.category === 'Radiologi') return dept === 'radiologi';
  if (cfg.category === 'Laboratorium') return dept === 'laboratorium';
  if (cfg.category === 'Rehabilitasi Medis') return dept === 'rehab_medis';
  if (cfg.category === 'Laundry') return dept === 'laundry';
  if (cfg.category === 'SIMRS') return dept === 'simrs';
  if (cfg.category === 'Rawat Jalan') return dept === 'rawat_jalan';

  if (cfg.category === 'IGD') {
    if (name === 'Waktu Tanggap SC') {
      return ['igd', 'operasi', 'kebidanan'].includes(dept);
    }
    return dept === 'igd';
  }

  if (cfg.category === 'Operasi & Anestesi') {
    if (name === 'Surgical Safety Checklist SC') {
      return ['operasi', 'kebidanan'].includes(dept);
    }
    return dept === 'operasi';
  }

  if (cfg.category === 'Rawat Inap') {
    return ['rawat_inap', 'icu', 'nicu', 'kebidanan', 'unit_khusus'].includes(dept);
  }

  if (cfg.category === 'Keselamatan Pasien') {
    if (['Reaksi Transfusi', 'Gelang Identitas', 'Serah Terima Pasien'].includes(name)) {
      return ['rawat_inap', 'icu', 'nicu', 'kebidanan', 'igd', 'hemodialisa', 'operasi', 'unit_khusus'].includes(dept);
    }
    if (['Identifikasi Pasien', 'Risiko Jatuh'].includes(name)) {
      return ['rawat_inap', 'icu', 'nicu', 'kebidanan', 'igd', 'rawat_jalan', 'hemodialisa', 'operasi', 'unit_khusus'].includes(dept);
    }
    return true; // Insiden Keselamatan, Kepatuhan Kebersihan Tangan, Kepatuhan Penggunaan APD
  }

  if (cfg.category === 'Pelayanan' || cfg.category === 'Kepuasan Pasien') {
    return true;
  }

  return false;
}

function isServiceRelevantForUnit(name, cfg, unit, savedMap, hasSavedSettings) {
  if (!unit) return true;
  const dept = detectUnitDepartment(unit);
  const defaultMatch = matchesUnitDepartmentDefault(name, cfg, dept);

  // Tables without unit_id must strictly belong to their respective department
  // so hospital-wide data from Farmasi/RM/HD/ICU/OK never leaks into other units.
  if (cfg.service.ignoreUnitId) {
    if (!defaultMatch) return false;
    if (hasSavedSettings) {
      const indIds = SERVICE_TO_INDICATOR_IDS[name] || [];
      const knownIds = indIds.filter(id => savedMap.has(id));
      if (knownIds.length > 0) {
        return knownIds.some(id => savedMap.get(id) === true);
      }
    }
    return true;
  }

  if (hasSavedSettings) {
    const indIds = SERVICE_TO_INDICATOR_IDS[name] || [];
    const knownIds = indIds.filter(id => savedMap.has(id));
    if (knownIds.length > 0) {
      return knownIds.some(id => savedMap.get(id) === true);
    }
  }

  return defaultMatch;
}

function evaluateIndicatorResult(name, s) {
  let achieved = false;
  let hasil = `${s.persen || 0}%`;

  if (name === 'Insiden Keselamatan') {
    hasil = `${s.total || 0} Kasus`;
    achieved = (s.total || 0) === 0;
  } else if (s.rataRata !== undefined) {
    hasil = `${s.rataRata}`;
    if (name === 'Rata Rata Menut waktu tunggu') {
      const match = String(s.rataRata).match(/\d+/g);
      if (match && match.length >= 2) {
        const racikanVal = parseFloat(match[0]);
        const nonRacikanVal = parseFloat(match[1]);
        achieved = racikanVal < 60 && nonRacikanVal < 30;
      } else {
        achieved = false;
      }
    } else {
      const standarStr = String(s.standar || '');
      const targetVal = parseFloat(standarStr.replace(/[^\d.]/g, ''));
      const rVal = parseFloat(s.rataRata);
      if (standarStr.includes('≤')) {
        achieved = rVal <= targetVal;
      } else {
        achieved = rVal >= targetVal;
      }
    }
  } else if (
    (name.includes('Kematian') && name !== 'Kejadian Kematian di Meja Operasi') ||
    name.includes('Kembali ICU') ||
    name.includes('Clotting') ||
    name.includes('Ketidakpatuhan')
  ) {
    hasil = `${s.total || 0} Kasus`;
    achieved = (s.total || 0) === 0;
  } else {
    const standarStr = String(s.standar || '');
    const targetVal = parseFloat(standarStr.replace(/[^\d.]/g, ''));
    const currentVal = parseFloat(s.persen || 0);
    if (standarStr.includes('<')) {
      achieved = currentVal < targetVal;
    } else if (standarStr.includes('≤')) {
      achieved = currentVal <= targetVal;
    } else if (standarStr.includes('≥')) {
      achieved = currentVal >= targetVal;
    } else if (standarStr.includes('>')) {
      achieved = currentVal > targetVal;
    } else if (targetVal === 0 || standarStr === '0%' || standarStr === '0') {
      achieved = currentVal <= targetVal;
    } else if (isNaN(targetVal)) {
      achieved = (s.total || 0) > 0;
    } else {
      achieved = currentVal >= targetVal;
    }
  }

  return {
    hasil,
    achieved,
    statusText: achieved ? 'Tercapai' : 'Belum Tercapai'
  };
}

function addFormattedExcelSheet(workbook, sheetName, titleText, subtitleText, rows, defaultHeaders = []) {
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  const headers = [...defaultHeaders];
  rows.forEach(r => {
    Object.keys(r).forEach(k => {
      if (!headers.includes(k)) headers.push(k);
    });
  });

  const colCount = Math.max(headers.length, 1);

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
    right: { style: 'thin', color: { argb: 'FF94A3B8' } }
  };

  // Row 1: Main Title
  ws.mergeCells(1, 1, 1, colCount);
  const titleRow = ws.getRow(1);
  titleRow.height = 28;
  for (let c = 1; c <= colCount; c++) {
    const cell = titleRow.getCell(c);
    if (c === 1) cell.value = titleText;
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'thin', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF0F172A' } }
    };
  }

  // Row 2: Subtitle (Periode & Unit)
  ws.mergeCells(2, 1, 2, colCount);
  const subtitleRow = ws.getRow(2);
  subtitleRow.height = 22;
  for (let c = 1; c <= colCount; c++) {
    const cell = subtitleRow.getCell(c);
    if (c === 1) cell.value = subtitleText;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  }

  // Row 3: Blank spacer
  ws.getRow(3).height = 10;

  // Row 4: Table Header
  const headerRow = ws.getRow(4);
  headerRow.height = 25;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Row 5+: Table Body
  if (rows.length === 0) {
    ws.mergeCells(5, 1, 5, colCount);
    const emptyRow = ws.getRow(5);
    emptyRow.height = 24;
    for (let c = 1; c <= colCount; c++) {
      const cell = emptyRow.getCell(c);
      if (c === 1) cell.value = 'Tidak ada data untuk periode dan unit terpilih.';
      cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    }
  } else {
    rows.forEach((r, rIdx) => {
      const excelRow = ws.getRow(5 + rIdx);
      excelRow.height = 20;
      const isEven = rIdx % 2 === 1;

      headers.forEach((h, cIdx) => {
        const cell = excelRow.getCell(cIdx + 1);
        const rawVal = r[h];
        const val = rawVal !== undefined && rawVal !== null && rawVal !== '' ? rawVal : '-';
        cell.value = val;

        const hLower = h.toLowerCase();
        let horiz = 'left';
        if (
          hLower === 'no' ||
          hLower === 'target' ||
          hLower === 'pencapaian' ||
          hLower === 'total data' ||
          hLower === 'status' ||
          hLower === 'hasil' ||
          hLower === 'no rm' ||
          hLower === 'usia' ||
          hLower.includes('tanggal') ||
          hLower.includes('jam') ||
          typeof val === 'number'
        ) {
          horiz = 'center';
        }

        const isStatus = hLower === 'status';
        const isHighlight = hLower === 'pencapaian' || hLower === 'hasil' || isStatus;

        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: isHighlight,
          color: isStatus
            ? { argb: val === 'Tercapai' ? 'FF15803D' : 'FFB91C1C' }
            : { argb: 'FF0F172A' }
        };

        if (isStatus) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: val === 'Tercapai' ? 'FFDCFCE7' : 'FFFEE2E2' }
          };
        } else if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }

        cell.alignment = { vertical: 'middle', horizontal: horiz, wrapText: true };
        cell.border = thinBorder;
      });
    });
  }

  // Auto-fit column widths
  headers.forEach((h, cIdx) => {
    let maxLen = h.length;
    rows.forEach(r => {
      const v = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
      if (v.length > maxLen) maxLen = v.length;
    });
    const minW = h.toLowerCase() === 'no' ? 6 : 12;
    ws.getColumn(cIdx + 1).width = Math.min(Math.max(maxLen + 4, minW), 50);
  });

  return ws;
}

async function getSummary(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    const pid = periode_id ? parseInt(periode_id, 10) : null;
    const uid = unit_id ? parseInt(unit_id, 10) : null;

    const queryWhere = {};
    if (pid) queryWhere.periode_id = pid;
    if (uid) queryWhere.unit_id = uid;

    let unit = null;
    const savedMap = new Map();
    let hasSavedSettings = false;

    if (uid) {
      const [unitDoc, savedConfigs] = await Promise.all([
        prisma.unit.findUnique({ where: { id: uid } }),
        prisma.unitIndicatorConfig.findMany({ where: { unit_id: uid } })
      ]);
      unit = unitDoc;
      savedConfigs.forEach(c => savedMap.set(c.indicator_id, c.aktif));
      hasSavedSettings = savedConfigs.length > 0;
    }

    const entries = Object.entries(services);
    const results = await Promise.all(
      entries.map(async ([name, cfg]) => {
        if (uid) {
          if (!unit) return null;
          const relevant = isServiceRelevantForUnit(name, cfg, unit, savedMap, hasSavedSettings);
          if (cfg.service.ignoreUnitId && !relevant) {
            return null;
          }
          const sw = { ...queryWhere, ...cfg.extraWhere };
          const sum = await cfg.service.getSummary(sw);
          if (!relevant && (!sum || !sum.total || sum.total === 0)) {
            return null;
          }
          return [name, { ...sum, category: cfg.category }];
        } else {
          const sw = { ...queryWhere, ...cfg.extraWhere };
          const sum = await cfg.service.getSummary(sw);
          return [name, { ...sum, category: cfg.category }];
        }
      })
    );

    const summaries = {};
    results.forEach(item => {
      if (item) {
        const [name, data] = item;
        summaries[name] = data;
      }
    });

    res.json({ success: true, data: summaries });
  } catch (err) {
    next(err);
  }
}

async function exportExcel(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    if (!periode_id) {
      return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
    }

    const pid = parseInt(periode_id, 10);
    const uid = unit_id ? parseInt(unit_id, 10) : null;

    const queryWhere = { periode_id: pid };
    if (uid) queryWhere.unit_id = uid;

    // Fetch the period details
    const pDetails = await prisma.periode.findUnique({ where: { id: pid } });
    if (!pDetails) {
      return res.status(404).json({ success: false, message: 'Periode tidak ditemukan' });
    }

    let unit = null;
    const savedMap = new Map();
    let hasSavedSettings = false;

    const [unitDoc, savedConfigs, hInfo] = await Promise.all([
      uid ? prisma.unit.findUnique({ where: { id: uid } }) : null,
      uid ? prisma.unitIndicatorConfig.findMany({ where: { unit_id: uid } }) : [],
      prisma.informasiRumahSakit.findFirst()
    ]);

    if (uid) {
      unit = unitDoc;
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit tidak ditemukan' });
      }
      savedConfigs.forEach(c => savedMap.set(c.indicator_id, c.aktif));
      hasSavedSettings = savedConfigs.length > 0;
    }

    const hospitalName = (hInfo && hInfo.nama_rs) ? hInfo.nama_rs.toUpperCase() : 'RUMAH SAKIT ISLAM KARAWANG';

    const listBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const namaBulan = listBulan[pDetails.bulan - 1];
    const unitLabel = unit ? unit.nama_unit : 'Semua Unit';

    const workbook = new ExcelJS.Workbook();
    workbook.creator = `SIMURS - ${hospitalName}`;
    workbook.created = new Date();

    // 1. Evaluate summaries and detailed records per indicator (filtered by unit when uid is set)
    const serviceEntries = Object.entries(services);
    const evaluatedEntries = await Promise.all(
      serviceEntries.map(async ([name, cfg]) => {
        if (uid) {
          const relevant = isServiceRelevantForUnit(name, cfg, unit, savedMap, hasSavedSettings);
          if (cfg.service.ignoreUnitId && !relevant) {
            return null;
          }
          const sumWhere = { ...queryWhere, ...cfg.extraWhere };
          const sum = await cfg.service.getSummary(sumWhere);

          const findWhere = { ...queryWhere, ...cfg.extraWhere };
          if (cfg.service.ignoreUnitId) delete findWhere.unit_id;
          if (cfg.table === 'mutuFarmasiKesalahanObat' || cfg.table === 'mutuRekamMedis') delete findWhere.tipe;
          const records = await prisma[cfg.table].findMany({ where: findWhere });

          if (!relevant && (!sum || !sum.total || sum.total === 0) && (!records || records.length === 0)) {
            return null;
          }
          return { name, cfg, sum, records };
        } else {
          const sumWhere = { ...queryWhere, ...cfg.extraWhere };
          const sum = await cfg.service.getSummary(sumWhere);

          const findWhere = { ...queryWhere, ...cfg.extraWhere };
          if (cfg.service.ignoreUnitId) delete findWhere.unit_id;
          if (cfg.table === 'mutuFarmasiKesalahanObat' || cfg.table === 'mutuRekamMedis') delete findWhere.tipe;
          const records = await prisma[cfg.table].findMany({ where: findWhere });

          return { name, cfg, sum, records };
        }
      })
    );

    const activeEntries = evaluatedEntries.filter(Boolean);

    // 2. Build Summary Ringkasan sheet with Title and Borders
    const summaryRows = activeEntries.map(({ name, cfg, sum }, idx) => {
      const evalRes = evaluateIndicatorResult(name, sum);
      return {
        'No': idx + 1,
        'Kategori': cfg.category,
        'Indikator Mutu': name,
        'Target': sum.standar || '-',
        'Pencapaian': evalRes.hasil,
        'Total Data': sum.total || 0,
        'Status': evalRes.statusText
      };
    });

    addFormattedExcelSheet(
      workbook,
      'Ringkasan Mutu',
      `LAPORAN CAPAIAN INDIKATOR MUTU - ${hospitalName}`,
      `Periode: ${namaBulan} ${pDetails.tahun}   |   Unit: ${unitLabel}`,
      summaryRows,
      ['No', 'Kategori', 'Indikator Mutu', 'Target', 'Pencapaian', 'Total Data', 'Status']
    );

    // 3. Generate detailed sheets for each indicator with Title and Borders
    const usedSheetNames = new Set(['Ringkasan Mutu']);
    for (const { name, cfg, records } of activeEntries) {
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
        } else if (cfg.table === 'laboratoriumKesalahanPenyerahan') {
          const jp = r.jumlah_pasien || 0;
          const jk = r.jumlah_kesalahan || 0;
          const presentase = jp > 0 ? parseFloat((((jp - jk) / jp) * 100).toFixed(2)) : 100;
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

      // Sheet names must be <= 31 chars and cannot contain invalid Excel sheet characters
      const cleanName = name.replace(/[:\\/?*[\]]/g, ' ').trim();
      let sheetName = cleanName.substring(0, 30);
      let counter = 1;
      while (usedSheetNames.has(sheetName)) {
        const suffix = `_${counter}`;
        sheetName = cleanName.substring(0, 30 - suffix.length) + suffix;
        counter++;
      }
      usedSheetNames.add(sheetName);

      addFormattedExcelSheet(
        workbook,
        sheetName,
        `LAPORAN DATA INDIKATOR MUTU: ${name.toUpperCase()}`,
        `Periode: ${namaBulan} ${pDetails.tahun}   |   Unit: ${unitLabel}   |   Kategori: ${cfg.category}`,
        rows
      );
    }

    // Write to buffer
    const buf = await workbook.xlsx.writeBuffer();
    const unitFilePart = unit
      ? `_${unit.nama_unit.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`
      : '';

    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Mutu${unitFilePart}_${namaBulan}_${pDetails.tahun}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buf));

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
        name: 'Kecepatan Waktu Tanggap Komplain',
        sample: [{ 'Tanggal': '2026-08-01', 'Nama Pasien': 'Andi Wijaya', 'No RM': 'RM-100264', 'Kategori Komplain': 'Merah', 'Lama Tanggap Jam': 2, 'Keterangan': 'Ditanggapi cepat' }]
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
      let rows = XLSX.utils.sheet_to_json(ws);
      if (rows.length > 0 && !rows[0]['Nama Pasien'] && !rows[0]['No RM'] && !rows[0]['Tanggal'] && !rows[0]['No']) {
        rows = XLSX.utils.sheet_to_json(ws, { range: 3 });
      }

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

        // Compatibility alias for waktuTanggapKomplain keterangan field
        if (payload.keterangan_komplain !== undefined && payload.keterangan === undefined) {
          payload.keterangan = payload.keterangan_komplain;
          delete payload.keterangan_komplain;
        }

        // Calculate kepatuhan for waktuTanggapKomplain
        if (cfg.table === 'waktuTanggapKomplain') {
          const kat = payload.kategori_komplain || 'Hijau';
          const lama = parseFloat(payload.lama_tanggap_jam) || 0;
          let batas = 168;
          const katLower = String(kat).toLowerCase();
          if (katLower.includes('merah')) batas = 24;
          else if (katLower.includes('kuning')) batas = 72;
          payload.kepatuhan = lama <= batas ? 1 : 0;
          payload.lama_tanggap_jam = lama;
        }

        // Parse numerical fields for kepuasanPasienPelayanan
        if (cfg.table === 'kepuasanPasienPelayanan') {
          if (payload.total_pasien !== undefined) payload.total_pasien = parseInt(payload.total_pasien, 10) || 0;
          if (payload.rata_rata_penilaian !== undefined) payload.rata_rata_penilaian = parseFloat(payload.rata_rata_penilaian) || 0;
          payload.persentase = payload.rata_rata_penilaian || 0;
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

module.exports = { getSummary, exportExcel, importExcel, downloadTemplate };
