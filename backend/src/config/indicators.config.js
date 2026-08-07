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
    id: 'kembali-icu',
    nama: 'Rata-rata Kembali Rawat Intensif < 72 jam',
    standar: '-',
    kategori_default: ['unit_khusus']
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
  },
  {
    id: 'waktu_tunggu_poliklinik',
    nama: 'Waktu Tunggu Rawat Jalan (Menit)',
    standar: 'Menit',
    kategori_default: ['rawat_jalan']
  },
  {
    id: 'waktu_tunggu_poliklinik_jam',
    nama: 'Waktu Tunggu Rawat Jalan (WT in Jam)',
    standar: '≤ 1 Jam',
    kategori_default: ['rawat_jalan']
  },
  {
    id: 'waktu_tunggu_poliklinik_kepatuhan',
    nama: 'Waktu Tunggu Rawat Jalan (≥ 80%)',
    standar: '≥ 80%',
    kategori_default: ['rawat_jalan']
  },
  {
    id: 'waktu_tunggu_poliklinik_rata_rata',
    nama: 'Waktu Tunggu Rawat Jalan (Rata-rata Poli)',
    standar: '-',
    kategori_default: ['rawat_jalan']
  },
  {
    id: 'penundaan_operasi_elektif',
    nama: 'Penundaan Operasi Elektif',
    standar: '≤ 5%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'informed_consent_pembedahaan',
    nama: 'Kelengkapan Pengisian Inform Concent Pembedahan',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'asesmen_pra_bedah',
    nama: 'Angka Kelengkapan Asesemen Pra Bedah',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'surgical_checklist_operasi',
    nama: 'Kepatuhan Melakukan Proses TimeOut Pasien Pre Operasi',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'surgical_checklist_sc',
    nama: 'Kepatuhan Melakukan Proses TimeOut Pasien Operasi SC',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'penandaan_lokasi_operasi',
    nama: '100% Pasien Yang dioperasi Ada Marker (Sesuai Ketentuan)',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'kematian_meja_operasi',
    nama: 'Kejadian Kematian di Meja Operasi',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'salah_sisi_operasi',
    nama: 'Kejadian Operasi Salah Sisi',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'operasi_salah_pasien',
    nama: 'Kejadian Operasi Salah Pasien',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'operasi_salah_prosedur',
    nama: 'Kejadian Operasi Salah Prosedur Tindakan',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'kelengkapan_ic_anestesi',
    nama: 'Kelengkapan IC Tindakan Anestesi Sedasi',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'asesmen_pra_anestesi',
    nama: 'Kelengkapan Asesmen Pre Anestesi Sedasi',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'kelengkapan_laporan_anestesi',
    nama: 'Kelengkapan Laporan Anestesi Sedasi',
    standar: '100%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'insiden-clotting-durante',
    nama: 'Insiden Clotting Durante HD',
    standar: '-',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'insiden-jarum-vena',
    nama: 'Insiden Terlepaskan Jarum Vena Fistula Intra Dialysis',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'jadwal-hemodialisa',
    nama: 'Ketidakpatuhan Pasien Tentang Jadwal Hemodialisa',
    standar: '-',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'waktu-tanggap-sc',
    nama: 'Waktu Tanggap Operasi Seksio Sesarea Emergency',
    standar: '≥ 80%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'insiden-pasien-jatuh-hd',
    nama: 'Insiden Pasien Jatuh Hemodialisis',
    standar: '0%',
    kategori_default: ['unit_khusus']
  },
  {
    id: 'tidaktersedia-obat-rawat-jalan',
    nama: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Jalan',
    standar: '≤ 5%',
    kategori_default: ['farmasi']
  },
  {
    id: 'tidaktersedia-obat-rawat-inap',
    nama: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Inap',
    standar: '≤ 5%',
    kategori_default: ['farmasi']
  },
  {
    id: 'salah-obat-rajal',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Jalan',
    standar: '0%',
    kategori_default: ['farmasi']
  },
  {
    id: 'salah-obat-ranap',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Inap',
    standar: '0%',
    kategori_default: ['farmasi']
  },
  {
    id: 'salah-obat-igd',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien IGD',
    standar: '0%',
    kategori_default: ['farmasi']
  },
  {
    id: 'total-salah-obat',
    nama: 'Total Kesalahan Pemberian Obat Pasien Rawat Jalan, Inap dan IGD',
    standar: '0%',
    kategori_default: ['farmasi']
  },
  {
    id: 'tunggu-obat-racik',
    nama: 'Waktu Tunggu Obat Racikan',
    standar: '≤ 60 Menit',
    kategori_default: ['farmasi']
  },
  {
    id: 'rata-tunggu-racikan',
    nama: 'Rata-rata Waktu Tunggu Obat Racikan Dalam Menit',
    standar: '-',
    kategori_default: ['farmasi']
  },
  {
    id: 'tunggu-obat-nonracik',
    nama: 'Waktu Tunggu Obat Non Racikan',
    standar: '≤ 30 Menit',
    kategori_default: ['farmasi']
  },
  {
    id: 'rata-tunggu-nonracikan',
    nama: 'Rata-rata Waktu Tunggu Obat Non Racikan Dalam Menit',
    standar: '-',
    kategori_default: ['farmasi']
  },
  {
    id: 'kepatuhan-formula-nasional',
    nama: 'Kepatuhan Penggunaan Formularium Nasional',
    standar: '≥ 80%',
    kategori_default: ['farmasi']
  },
  {
    id: 'double-check-obat-farmasi',
    nama: 'Kepatuhan Pelaksanaan Double Check Obat High Alert',
    standar: '≥ 80%',
    kategori_default: ['farmasi']
  },
  {
    id: 'hasil-kritis-lab',
    nama: 'Pelaporan Hasil Kritis Laboratorium  ≤ 30 menit',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'waktu-tunggu-lab-kurangdari',
    nama: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik',
    standar: '<= 140 Menit',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'waktu-tunggu-lab-lebihdari',
    nama: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik',
    standar: '>= 140 Menit',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'dalam-menit-perpasien',
    nama: 'Jumlah Dalam Menit Perpasien',
    standar: '-',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'kerusakan-sample-lab',
    nama: 'Tidak Adanya Kerusakan Sampel di Laboratorium',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'kesalahan-input-lab',
    nama: 'Tidak Adanya Kesalahan Input Data Hasil Pemeriksaan Lab',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'kepatuhan-identifikasi-lab',
    nama: 'Kepatuhan Identifikasi Pasien',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'ekpertisi-dokter-lab',
    nama: 'Ekspertisi Oleh Dokter Spesialis Patologi Klinik',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'kesalahan-penyerahan-hasil-lab',
    nama: 'Tidak Adanya Kesalahan Penyerahan Hasil Laboratorium',
    standar: '100%',
    kategori_default: ['penunjang', 'laboratorium']
  },
  {
    id: 'waktu-tunggu-sesuai-foto-thorax',
    nama: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Sesuai Jadwal)',
    standar: '< 3 Jam',
    kategori_default: ['penunjang', 'radiologi']
  },
  {
    id: 'waktu-tunggu-diluar-foto-thorax',
    nama: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Diluar Jadwal)',
    standar: '> 3 Jam',
    kategori_default: ['penunjang', 'radiologi']
  },
  {
    id: 'kepatuhan-identifikasi-pasien-radiologi',
    nama: 'Kepatuhan Identifikasi Pasien Radiologi',
    standar: '100%',
    kategori_default: ['penunjang', 'radiologi']
  },
  {
    id: 'kelengkapan-form-radiologi',
    nama: 'Kelengkapan Pengisian Form Info Tindakan Radiologi',
    standar: '≥ 85%',
    kategori_default: ['penunjang', 'radiologi']
  },
  {
    id: 'foto-ulang-pasien-radiologi',
    nama: 'Kejadian Foto Ulang Pasien',
    standar: '-',
    kategori_default: ['penunjang', 'radiologi']
  },
  {
    id: 'waktu-gizi-pasien',
    nama: 'Ketepatan Waktu Pemberian Makan Pada Pasien',
    standar: '≥ 90%',
    kategori_default: ['penunjang', 'gizi']
  },
  {
    id: 'salah-gizi-diet',
    nama: 'Tidak Adanya Kejadian Salah Pemberian Diet Pasien',
    standar: '100%',
    kategori_default: ['penunjang', 'gizi']
  },
  {
    id: 'sisa-gizi-pasien',
    nama: 'Sisa Makanan Yang Tidak Termakan Oleh Pasien',
    standar: '≤ 20%',
    kategori_default: ['penunjang', 'gizi']
  },
  {
    id: 'simrs-gizi-identifikasi',
    nama: 'Penulisan Pasien Di SIMRS Sesuai Ruangan, Bed, RM, Diet Pasien',
    standar: '≥ 85%',
    kategori_default: ['penunjang', 'gizi']
  },
  {
    id: 'rm-dokumen',
    nama: 'Kelengkapan Dokumen Rekam Medis Pasien Ranap',
    standar: '100%',
    kategori_default: ['penunjang', 'rekam_medis']
  },
  {
    id: 'rm-pengisian-dok',
    nama: 'Standar Pengembalian & Pengisian Dok RM 1 x 24 Jam',
    standar: '1x24 Jam',
    kategori_default: ['penunjang', 'rekam_medis']
  },
  {
    id: 'rm-antrian-online',
    nama: 'Pemberian Informasi Antrian Online',
    standar: '85%',
    kategori_default: ['penunjang', 'rekam_medis']
  },
  {
    id: 'rm-coding-rwi-rwj',
    nama: 'Ketepatan Coding Rawat Inap & Rawat Jalan',
    standar: '100%',
    kategori_default: ['penunjang', 'rekam_medis']
  },
  {
    id: 'rm-jkn',
    nama: 'Antrian Mobile JKN',
    standar: '30%',
    kategori_default: ['penunjang', 'rekam_medis']
  },
  {
    id: 'rehab-drop-pasien',
    nama: 'Kejadian Drop Out Pasien Terhadap Pelayanan Rehabilitasi Medis',
    standar: '≤ 50%',
    kategori_default: ['penunjang', 'rehab_medis']
  },
  {
    id: 'rehab-kesalahan-tindakan',
    nama: 'Tidak Adanya Kejadian Kesalahan Tindakan Rehabilitasi Medis',
    standar: '100%',
    kategori_default: ['penunjang', 'rehab_medis']
  },
  {
    id: 'rehab-waktu-tunggu',
    nama: 'Waktu Tunggu Pelayanan Rawat Jalan Rehabilitasi Medis',
    standar: '≤ 60 menit',
    kategori_default: ['penunjang', 'rehab_medis']
  },
  {
    id: 'rehab-identifikasi',
    nama: 'Kepatuhan Identifikasi Pasien',
    standar: '100%',
    kategori_default: ['penunjang', 'rehab_medis']
  },
  {
    id: 'laundry-linen-hilang',
    nama: 'Tidak Adanya Kejadian Linen Yang Hilang',
    standar: '100%',
    kategori_default: ['penunjang', 'laundry']
  },
  {
    id: 'laundry-waktu-linen',
    nama: 'Ketepatan Waktu Penyediaan Linen Untuk Ruang Rawat Inap',
    standar: '100%',
    kategori_default: ['penunjang', 'laundry']
  },
  {
    id: 'laundry-waktu-instrumen-op',
    nama: 'Ketepatan Waktu Penyediaan Instrumen Operasi Siap Pakai Ke Kamar Bedah',
    standar: '100%',
    kategori_default: ['penunjang', 'laundry']
  },
  {
    id: 'laundry-sterilisasi',
    nama: 'Kesesuain Prosedur Sterilisasi Alat-Alat Medis',
    standar: '100%',
    kategori_default: ['penunjang', 'laundry']
  },
  {
    id: 'simrs-waktu-menanggapi',
    nama: 'Kecepatan Waktu Menanggapi Kerusakan SIMRS',
    standar: '≤ 15 Menit',
    kategori_default: ['penunjang', 'simrs']
  },
  {
    id: 'simrs-persentase-pelaksanaan',
    nama: 'Persentase Pelaksanaan Maintenance Perangkat Keras',
    standar: '-',
    kategori_default: ['penunjang', 'simrs']
  },
  {
    id: 'kepuasan_pasien_pelayanan',
    nama: 'Kepuasan Pasien Pada Pelayanan',
    standar: '≥ 76,61%',
    kategori_default: ['rawat_inap', 'rawat_jalan', 'unit_khusus', 'igd', 'penunjang']
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
  }
];

module.exports = {
  AVAILABLE_INDICATORS
};

