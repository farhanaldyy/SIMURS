/**
 * Master List / Dictionary dari seluruh Indikator Mutu yang terdaftar di SIMURS.
 * Digunakan untuk konfigurasi mapping indikator per unit & modul Rekap Mutu.
 */
const AVAILABLE_INDICATORS = [
  {
    id: 'reaksi_transfusi',
    nama: 'Angka Kejadian Reaksi Transfusi',
    standar: '≤ 0.01%',
    kategori_default: ['rawat_inap', 'unit_khusus']
  },
  {
    id: 'identifikasi_pasien',
    nama: 'Kepatuhan Identifikasi Pasien',
    standar: '100%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'igd', 'rawat_jalan']
  },
  {
    id: 'risiko_jatuh',
    nama: 'Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh',
    standar: '100%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'rawat_jalan']
  },
  {
    id: 'visit_dokter',
    nama: 'Kepatuhan Visit Dokter Spesialis',
    standar: '≥ 80%',
    kategori_default: ['rawat_inap', 'unit_khusus']
  },
  {
    id: 'alur_klinis',
    nama: 'Kepatuhan Terhadap Alur Klinis (Clinical Pathway)',
    standar: '≥ 80%',
    kategori_default: ['rawat_inap', 'unit_khusus']
  },
  {
    id: 'double_check_high_alert',
    nama: 'Kepatuhan Pelaksanaan Double Check Obat High Alert',
    standar: '≥ 80%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'farmasi']
  },
  {
    id: 'kepatuhan_kebersihan_tangan',
    nama: 'Kepatuhan Kebersihan Tangan',
    standar: '≥ 85%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'igd', 'rawat_jalan', 'farmasi', 'penunjang']
  },
  {
    id: 'kepatuhan_apd',
    nama: 'Kepatuhan Penggunaan APD',
    standar: '100%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'igd', 'rawat_jalan', 'farmasi', 'penunjang']
  },
  {
    id: 'insiden_keselamatan',
    nama: 'Insiden Keselamatan Pasien',
    standar: '0%',
    kategori_default: ['rawat_inap', 'unit_khusus', 'igd', 'rawat_jalan', 'farmasi', 'penunjang']
  },
  {
    id: 'angka_kematian_ranap',
    nama: 'Kejadian Pasien Meninggal di Rawat Inap',
    standar: '0%',
    kategori_default: ['rawat_inap', 'unit_khusus']
  },
  {
    id: 'emergency_response_time',
    nama: 'Waktu Tanggap Pelayanan Dokter di Gawat Darurat',
    standar: '≤ 5 menit',
    kategori_default: ['igd']
  },
  {
    id: 'asesmen_awal_igd',
    nama: 'Kelengkapan Asesmen Awal IGD',
    standar: '100%',
    kategori_default: ['igd']
  },
  {
    id: 'gelang_identitas',
    nama: 'Pemasangan Gelang Identitas',
    standar: '100%',
    kategori_default: ['igd', 'rawat_inap', 'unit_khusus']
  },
  {
    id: 'serah_terima_pasien',
    nama: 'Kesesuaian Pelaksanaan Serah Terima Pasien',
    standar: '100%',
    kategori_default: ['igd', 'rawat_inap', 'unit_khusus']
  },
  {
    id: 'pasien_tertahan_igd',
    nama: 'Pasien Tertahan di IGD',
    standar: '-',
    kategori_default: ['igd']
  },
  {
    id: 'angka_kematian_igd',
    nama: 'Angka Kematian Pasien di IGD',
    standar: '-',
    kategori_default: ['igd']
  }
];

module.exports = {
  AVAILABLE_INDICATORS
};
