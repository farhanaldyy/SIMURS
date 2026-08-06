const prisma = require('../config/database');
const ExcelJS = require('exceljs');

const { AVAILABLE_INDICATORS } = require('../config/indicators.config');

// Master List of Indicator Configurations for Rekap Mutu
const ALL_INDICATOR_CONFIGS = [
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
  {
    no: 11,
    id: 'kembali-icu',
    nama: 'Rata-rata Kembali Rawat Intensif < 72 jam ( - ) - Nama Modul: Kembali ICU',
    nama_modul: 'Rata-rata Kembali Rawat Intensif < 72 jam',
    standar: '-',
    label_numerator: 'Total Data Kembali ICU',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kembali-icu.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 11,
    id: 'emergency_response_time',
    nama: 'Waktu Tanggap Pelayanan Dokter di Gawat Darurat ( ≤ 5 menit ) - Nama Modul: Emergency Response Time',
    nama_modul: 'Waktu Tanggap Pelayanan Dokter di Gawat Darurat',
    standar: '≤ 5 menit',
    label_numerator: 'Total Pasien Tanggap ≤ 5 Menit (“N”)',
    label_denominator: 'Total Populasi Pasien (“D”)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/emergency-response-time.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 12,
    id: 'asesmen_awal_igd',
    nama: 'Kelengkapan Asesmen Awal IGD ( 100% ) - Nama Modul: Asesmen Awal IGD',
    nama_modul: 'Kelengkapan Asesmen Awal IGD',
    standar: '100%',
    label_numerator: 'Total Data (Ada)',
    label_denominator: 'Total Data (Ada + Tidak Ada)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/asesmen-awal-igd.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 13,
    id: 'gelang_identitas',
    nama: 'Pemasangan Gelang Identitas ( 100% ) - Nama Modul: Gelang Identitas',
    nama_modul: 'Pemasangan Gelang Identitas',
    standar: '100%',
    label_numerator: 'Total Data (Lengkap)',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/gelang-identitas.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 14,
    id: 'serah_terima_pasien',
    nama: 'Kesesuaian Pelaksanaan Serah Terima Pasien ( 100% ) - Nama Modul: Serah Terima Pasien',
    nama_modul: 'Kesesuaian Pelaksanaan Serah Terima Pasien',
    standar: '100%',
    label_numerator: 'Total Data (Sesuai)',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/serah-terima-pasien.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 15,
    id: 'pasien_tertahan_igd',
    nama: 'Pasien Tertahan di IGD ( - ) - Nama Modul: Pasien Tertahan IGD',
    nama_modul: 'Pasien Tertahan di IGD',
    standar: '-',
    label_numerator: 'Total Data Pasien Tertahan',
    label_denominator: 'Total Data Populasi Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/pasien-tertahan-igd.service'),
    extract: (summary) => {
      const num = summary.jumlahTertahan !== undefined ? summary.jumlahTertahan : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 16,
    id: 'angka_kematian_igd',
    nama: 'Angka Kematian Pasien di IGD ( - ) - Nama Modul: Angka Kematian IGD',
    nama_modul: 'Angka Kematian Pasien di IGD',
    standar: '-',
    label_numerator: 'Total Data Pasien Meninggal',
    label_denominator: 'Total Data Populasi Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/angka-kematian-igd.service'),
    extract: (summary) => {
      const num = summary.jumlahKematian !== undefined ? summary.jumlahKematian : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 17,
    id: 'waktu_tunggu_poliklinik',
    nama: 'Waktu Tunggu Rawat Jalan (Menit) - Nama Modul: Waktu Tunggu Rawat Jalan',
    nama_modul: 'Waktu Tunggu Rawat Jalan (Menit)',
    standar: 'Menit',
    label_numerator: 'Total Akumulasi Menit (“N”)',
    label_denominator: 'Total Pasien (“D”)',
    formula: 'Numerator / Denumerator',
    service: require('./modules/waktu-tunggu-poliklinik.service'),
    extract: (summary) => {
      const num = summary.totalWaktuTunggu !== undefined ? summary.totalWaktuTunggu : 0;
      const den = summary.totalPasien !== undefined ? summary.totalPasien : 0;
      return { num, den };
    },
    calculateCapaian: (num, den) => den > 0 ? parseFloat((num / den).toFixed(2)) : 0
  },
  {
    no: 18,
    id: 'waktu_tunggu_poliklinik_jam',
    nama: 'Waktu Tunggu Rawat Jalan (WT in Jam) - Nama Modul: Waktu Tunggu Rawat Jalan',
    nama_modul: 'Waktu Tunggu Rawat Jalan (WT in Jam)',
    standar: '≤ 1 Jam',
    label_numerator: '-',
    label_denominator: 'Konstanta 6 (“D”)',
    formula: 'Capaian Menit / 6',
    service: require('./modules/waktu-tunggu-poliklinik.service'),
    isCalculatedFromMenit: true,
    extract: (summary) => {
      const num = null;
      const den = 6;
      return { num, den };
    }
  },
  {
    no: 19,
    id: 'waktu_tunggu_poliklinik_kepatuhan',
    nama: 'Waktu Tunggu Rawat Jalan (≥ 80%) - Nama Modul: Waktu Tunggu Rawat Jalan',
    nama_modul: 'Waktu Tunggu Rawat Jalan (≥ 80%)',
    standar: '≥ 80%',
    label_numerator: 'Poli Sesuai Standar ≤60m (“N”)',
    label_denominator: 'Total Poliklinik (“D”)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/waktu-tunggu-poliklinik.service'),
    extract: (summary) => {
      const num = summary.totalPatuh !== undefined ? summary.totalPatuh : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 20,
    id: 'waktu_tunggu_poliklinik_rata_rata',
    nama: 'Waktu Tunggu Rawat Jalan (Rata-rata Poli) - Nama Modul: Waktu Tunggu Rawat Jalan',
    nama_modul: 'Waktu Tunggu Rawat Jalan (Rata-rata Poli)',
    standar: '-',
    label_numerator: 'Total Akumulasi Menit (“N”)',
    label_denominator: 'Total Poliklinik (“D”)',
    formula: 'Numerator / Denumerator',
    service: require('./modules/waktu-tunggu-poliklinik.service'),
    extract: (summary) => {
      const num = summary.totalWaktuTunggu !== undefined ? summary.totalWaktuTunggu : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    },
    calculateCapaian: (num, den) => den > 0 ? parseFloat((num / den).toFixed(2)) : 0
  },
  {
    no: 21,
    id: 'penundaan_operasi_elektif',
    nama: 'Penundaan Operasi Elektif ( ≤ 5% ) - Nama Modul: Penundaan Operasi Elektif',
    nama_modul: 'Penundaan Operasi Elektif',
    standar: '≤ 5%',
    label_numerator: 'Total Data Pasien Operasi Elektif',
    label_denominator: 'Total Data Penundaan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/penundaan-operasi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 22,
    id: 'informed_consent_pembedahaan',
    nama: 'Kelengkapan Pengisian Inform Concent Pembedahan ( 100% ) - Nama Modul: Informed Consent Pembedahan',
    nama_modul: 'Kelengkapan Pengisian Inform Concent Pembedahan',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/informed-consent-pembedahan.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 23,
    id: 'asesmen_pra_bedah',
    nama: 'Angka Kelengkapan Asesemen Pra Bedah ( 100% ) - Nama Modul: Asesmen Pra Bedah',
    nama_modul: 'Angka Kelengkapan Asesemen Pra Bedah',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/asesmen-pra-bedah.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 24,
    id: 'surgical_checklist_operasi',
    nama: 'Kepatuhan Melakukan Proses TimeOut Pasien Pre Operasi ( 100% ) - Nama Modul: Surgical Safety Checklist Op',
    nama_modul: 'Kepatuhan Melakukan Proses TimeOut Pasien Pre Operasi',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/surgical-checklist-operasi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 25,
    id: 'surgical_checklist_sc',
    nama: 'Kepatuhan Melakukan Proses TimeOut Pasien Operasi SC ( 100% ) - Nama Modul: Surgical Safety Checklist SC',
    nama_modul: 'Kepatuhan Melakukan Proses TimeOut Pasien Operasi SC',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/surgical-checklist-sc.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 26,
    id: 'penandaan_lokasi_operasi',
    nama: '100% Pasien Yang dioperasi Ada Marker (Sesuai Ketentuan) ( 100% ) - Nama Modul: Penandaan Lokasi Operasi',
    nama_modul: '100% Pasien Yang dioperasi Ada Marker (Sesuai Ketentuan)',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/penandaan-lokasi-operasi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : (summary.total || 0);
      return { num, den };
    }
  },
  {
    no: 27,
    id: 'kematian_meja_operasi',
    nama: 'Kejadian Kematian di Meja Operasi ( 0% ) - Nama Modul: Mutu Kamar Operasi',
    nama_modul: 'Kejadian Kematian di Meja Operasi',
    standar: '0%',
    label_numerator: 'Total Data Kejadian',
    label_denominator: 'Total Data Operasi',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-kamar-operasi.service'),
    extraWhere: { tipe: 'kematian_meja_operasi' },
    extract: (summary) => {
      const num = summary.total !== undefined ? summary.total : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 28,
    id: 'salah_sisi_operasi',
    nama: 'Kejadian Operasi Salah Sisi ( 0% ) - Nama Modul: Mutu Kamar Operasi',
    nama_modul: 'Kejadian Operasi Salah Sisi',
    standar: '0%',
    label_numerator: 'Total Data Kejadian',
    label_denominator: 'Total Data Operasi',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-kamar-operasi.service'),
    extraWhere: { tipe: 'salah_sisi' },
    extract: (summary) => {
      const num = summary.total !== undefined ? summary.total : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 29,
    id: 'operasi_salah_pasien',
    nama: 'Kejadian Operasi Salah Pasien ( 0% ) - Nama Modul: Mutu Kamar Operasi',
    nama_modul: 'Kejadian Operasi Salah Pasien',
    standar: '0%',
    label_numerator: 'Total Data Kejadian',
    label_denominator: 'Total Data Operasi',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-kamar-operasi.service'),
    extraWhere: { tipe: 'salah_orang' },
    extract: (summary) => {
      const num = summary.total !== undefined ? summary.total : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 30,
    id: 'operasi_salah_prosedur',
    nama: 'Kejadian Operasi Salah Prosedur Tindakan ( 0% ) - Nama Modul: Mutu Kamar Operasi',
    nama_modul: 'Kejadian Operasi Salah Prosedur Tindakan',
    standar: '0%',
    label_numerator: 'Total Data Kejadian',
    label_denominator: 'Total Data Operasi',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-kamar-operasi.service'),
    extraWhere: { tipe: 'salah_prosedur' },
    extract: (summary) => {
      const num = summary.total !== undefined ? summary.total : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 31,
    id: 'kelengkapan_ic_anestesi',
    nama: 'Kelengkapan IC Tindakan Anestesi Sedasi ( 100% ) - Nama Modul: Informed Consent Anestesi',
    nama_modul: 'Kelengkapan IC Tindakan Anestesi Sedasi',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/informed-consent-anestesi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 32,
    id: 'asesmen_pra_anestesi',
    nama: 'Kelengkapan Asesmen Pre Anestesi Sedasi ( 100% ) - Nama Modul: Asesmen Pra Anestesi',
    nama_modul: 'Kelengkapan Asesmen Pre Anestesi Sedasi',
    standar: '100%',
    label_numerator: 'Total Data Patuh',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/asesmen-pra-anestesi.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.total !== undefined ? summary.total : 0;
      return { num, den };
    }
  },
  {
    no: 33,
    id: 'kelengkapan_laporan_anestesi',
    nama: 'Kelengkapan Laporan Anestesi Sedasi ( 100% ) - Nama Modul: Mutu Kamar Operasi',
    nama_modul: 'Kelengkapan Laporan Anestesi Sedasi',
    standar: '100%',
    label_numerator: 'Total Data Kelengkapan Laporan',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-kamar-operasi.service'),
    extraWhere: { tipe: 'laporan_anestesi' },
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 34,
    id: 'insiden-clotting-durante',
    nama: 'Insiden Clotting Durante HD ( - ) - Nama Modul: Insiden Clotting Durante HD',
    nama_modul: 'Insiden Clotting Durante HD',
    standar: '-',
    label_numerator: 'Total Data Kejadian (Clotting)',
    label_denominator: 'Total Data Pasien HD',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/insiden-clotting.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 35,
    id: 'insiden-jarum-vena',
    nama: 'Insiden Terlepaskan Jarum Vena Fistula Intra Dialysis ( 0% ) - Nama Modul: Insiden Jarum Vena',
    nama_modul: 'Insiden Terlepaskan Jarum Vena Fistula Intra Dialysis',
    standar: '0%',
    label_numerator: 'Total Data Insiden',
    label_denominator: 'Total Data Pemasangan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/insiden-jarum-vena.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 36,
    id: 'jadwal-hemodialisa',
    nama: 'Ketidakpatuhan Pasien Tentang Jadwal Hemodialisa ( - ) - Nama Modul: Ketidakpatuhan HD',
    nama_modul: 'Ketidakpatuhan Pasien Tentang Jadwal Hemodialisa',
    standar: '-',
    label_numerator: 'Total Data Pasien Tidak Patuh',
    label_denominator: 'Total Data Pasien HD',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/ketidakpatuhan-hd.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 37,
    id: 'waktu-tanggap-sc',
    nama: 'Waktu Tanggap Operasi Seksio Sesarea Emergency ( ≥ 80% ) - Nama Modul: Waktu Tanggap SC Emergency',
    nama_modul: 'Waktu Tanggap Operasi Seksio Sesarea Emergency',
    standar: '≥ 80%',
    label_numerator: 'Total Data Tepat Waktu (≤ Standar)',
    label_denominator: 'Total Pasien SC Emergency',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/waktu-tanggap-sc.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : (summary.total || 0);
      return { num, den };
    }
  },
  {
    no: 38,
    id: 'insiden-pasien-jatuh-hd',
    nama: 'Insiden Pasien Jatuh Hemodialisis ( 0% ) - Nama Modul: Insiden Pasien Jatuh HD',
    nama_modul: 'Insiden Pasien Jatuh Hemodialisis',
    standar: '0%',
    label_numerator: 'Total Kejadian Pasien Jatuh HD',
    label_denominator: 'Total Pasien HD',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/insiden-pasien-jatuh-hd.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : (summary.total || 0);
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 39,
    id: 'tidaktersedia-obat-rawat-jalan',
    nama: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Jalan ( ≤ 5% ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Jalan',
    standar: '≤ 5%',
    label_numerator: 'Total tidak tersedia',
    label_denominator: 'Total obat',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'tidak_tersedia_rajal' },
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 40,
    id: 'tidaktersedia-obat-rawat-inap',
    nama: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Inap ( ≤ 5% ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Angka Kejadian Ketidaktersediaan Obat di Farmasi Rawat Inap',
    standar: '≤ 5%',
    label_numerator: 'Total tidak tersedia',
    label_denominator: 'Total obat',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'tidak_tersedia_ranap' },
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 41,
    id: 'salah-obat-rajal',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Jalan ( 0% ) - Nama Modul: Kesalahan Penyerahan Obat',
    nama_modul: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Jalan',
    standar: '0%',
    label_numerator: 'Total Data Salah Rawat Jalan',
    label_denominator: 'Total Resep Obat Rawat Jalan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kesalahan-penyerahan-obat.service'),
    extract: (summary) => {
      const num = summary.salah_rajal !== undefined ? summary.salah_rajal : 0;
      const den = summary.resep_rajal !== undefined ? summary.resep_rajal : 0;
      return { num, den };
    }
  },
  {
    no: 42,
    id: 'salah-obat-ranap',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Inap ( 0% ) - Nama Modul: Kesalahan Penyerahan Obat',
    nama_modul: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien Rawat Inap',
    standar: '0%',
    label_numerator: 'Total Data Salah Rawat Inap',
    label_denominator: 'Total Resep Obat Rawat Inap',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kesalahan-penyerahan-obat.service'),
    extract: (summary) => {
      const num = summary.salah_ranap !== undefined ? summary.salah_ranap : 0;
      const den = summary.resep_ranap !== undefined ? summary.resep_ranap : 0;
      return { num, den };
    }
  },
  {
    no: 43,
    id: 'salah-obat-igd',
    nama: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien IGD ( 0% ) - Nama Modul: Kesalahan Penyerahan Obat',
    nama_modul: 'Tidak Adanya Kejadian Kesalahan Pemberian Obat Pasien IGD',
    standar: '0%',
    label_numerator: 'Total Data Salah IGD',
    label_denominator: 'Total Resep Obat IGD',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kesalahan-penyerahan-obat.service'),
    extract: (summary) => {
      const num = summary.salah_igd !== undefined ? summary.salah_igd : 0;
      const den = summary.resep_igd !== undefined ? summary.resep_igd : 0;
      return { num, den };
    }
  },
  {
    no: 44,
    id: 'total-salah-obat',
    nama: 'Total Kesalahan Pemberian Obat Pasien Rawat Jalan, Inap dan IGD ( 0% ) - Nama Modul: Kesalahan Penyerahan Obat',
    nama_modul: 'Total Kesalahan Pemberian Obat Pasien Rawat Jalan, Inap dan IGD',
    standar: '0%',
    label_numerator: 'Total Data Kesalahan',
    label_denominator: 'Total Resep Obat',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kesalahan-penyerahan-obat.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 45,
    id: 'tunggu-obat-racik',
    nama: 'Waktu Tunggu Obat Racikan ( ≤ 60 Menit ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Waktu Tunggu Obat Racikan',
    standar: '≤ 60 Menit',
    label_numerator: 'Total Waktu Tunggu Obat Racikan',
    label_denominator: 'Total Obat Racikan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'waktu_tunggu' },
    extract: (summary) => {
      const num = summary.val2 !== undefined ? summary.val2 : 0;
      const den = summary.val1 !== undefined ? summary.val1 : 0;
      return { num, den };
    }
  },
  {
    no: 46,
    id: 'rata-tunggu-racikan',
    nama: 'Rata-rata Waktu Tunggu Obat Racikan Dalam Menit ( - ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Rata-rata Waktu Tunggu Obat Racikan Dalam Menit',
    standar: '-',
    label_numerator: '-',
    label_denominator: '-',
    formula: 'Rata-rata (Menit)',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'rata_waktu_tunggu' },
    extract: (summary) => {
      const val = summary.val1 !== undefined ? parseFloat(summary.val1 || 0) : 0;
      return { num: '-', den: '-', capaian: val };
    }
  },
  {
    no: 47,
    id: 'tunggu-obat-nonracik',
    nama: 'Waktu Tunggu Obat Non Racikan ( ≤ 30 Menit ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Waktu Tunggu Obat Non Racikan',
    standar: '≤ 30 Menit',
    label_numerator: 'Total Waktu Tunggu Obat Non Racikan',
    label_denominator: 'Total Obat Non Racikan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'waktu_tunggu' },
    extract: (summary) => {
      const num = summary.val4 !== undefined ? summary.val4 : 0;
      const den = summary.val3 !== undefined ? summary.val3 : 0;
      return { num, den };
    }
  },
  {
    no: 48,
    id: 'rata-tunggu-nonracikan',
    nama: 'Rata-rata Waktu Tunggu Obat Non Racikan Dalam Menit ( - ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Rata-rata Waktu Tunggu Obat Non Racikan Dalam Menit',
    standar: '-',
    label_numerator: '-',
    label_denominator: '-',
    formula: 'Rata-rata (Menit)',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'rata_waktu_tunggu' },
    extract: (summary) => {
      const val = summary.val2 !== undefined ? parseFloat(summary.val2 || 0) : 0;
      return { num: '-', den: '-', capaian: val };
    }
  },
  {
    no: 49,
    id: 'kepatuhan-formula-nasional',
    nama: 'Kepatuhan Penggunaan Formularium Nasional ( ≥ 80% ) - Nama Modul: Kepatuhan Fornas',
    nama_modul: 'Kepatuhan Penggunaan Formularium Nasional',
    standar: '≥ 80%',
    label_numerator: 'Total Resep Sesuai Fornas',
    label_denominator: 'Total Resep',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/kepatuhan-fornas.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 50,
    id: 'double-check-obat-farmasi',
    nama: 'Kepatuhan Pelaksanaan Double Check Obat High Alert ( ≥ 80% ) - Nama Modul: Mutu Farmasi',
    nama_modul: 'Kepatuhan Pelaksanaan Double Check Obat High Alert',
    standar: '≥ 80%',
    label_numerator: 'Total Double Check',
    label_denominator: 'Total Obat',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/mutu-farmasi.service'),
    extraWhere: { tipe: 'double_check' },
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 51,
    id: 'hasil-kritis-lab',
    nama: 'Pelaporan Hasil Kritis Laboratorium  ≤ 30 menit ( 100% ) - Nama Modul: Pelaporan Hasil Kritis Lab',
    nama_modul: 'Pelaporan Hasil Kritis Laboratorium  ≤ 30 menit',
    standar: '100%',
    label_numerator: 'Total < 30 Menit',
    label_denominator: 'Total Nilai Kritis',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/laboratorium-hasil-kritis.service'),
    extract: (summary) => {
      const num = summary.total_lt_30 !== undefined ? summary.total_lt_30 : 0;
      const den = summary.total_nilai_kritis !== undefined ? summary.total_nilai_kritis : 0;
      return { num, den };
    }
  },
  {
    no: 52,
    id: 'waktu-tunggu-lab-kurangdari',
    nama: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik ( <= 140 Menit ) - Nama Modul: Waktu Tunggu Hasil Lab <= 140 Menit',
    nama_modul: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik ( <= 140 Menit )',
    standar: '<= 140 Menit',
    label_numerator: 'Total Pasien <= 140 Menit',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/laboratorium-waktu-tunggu-gt-140.service'),
    extract: async (summary, queryWhere) => {
      const gt140Service = require('./modules/laboratorium-waktu-tunggu-gt-140.service');
      const lt140Service = require('./modules/laboratorium-waktu-tunggu-lt-140.service');

      const summaryGt = await gt140Service.getSummary(queryWhere);
      const summaryLt = await lt140Service.getSummary(queryWhere);

      // N: total data pasien dikurang (-) total data Pasien >= 140 Menit (dari modul Waktu Tunggu Hasil Lab >= 140 Menit)
      const num = summaryGt && summaryGt.total_pasien_lt_140 !== undefined
        ? summaryGt.total_pasien_lt_140
        : (summaryGt ? Math.max(0, (summaryGt.total_pasien || 0) - (summaryGt.total_pasien_gt_140 || 0)) : 0);

      // D: total data pasien Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik ( <= 140 Menit ) (dari modul Waktu Tunggu Hasil Lab < 140 Menit)
      const den = summaryLt && summaryLt.total_pasien !== undefined
        ? summaryLt.total_pasien
        : 0;

      return { num, den };
    }
  },
  {
    no: 53,
    id: 'waktu-tunggu-lab-lebihdari',
    nama: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik ( >= 140 Menit ) - Nama Modul: Waktu Tunggu Hasil Lab > 140 Menit',
    nama_modul: 'Waktu Tunggu Hasil Pemeriksaan Laboratorium Klinik ( >= 140 Menit )',
    standar: '>= 140 Menit',
    label_numerator: 'Total Pasien >= 140 Menit',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/laboratorium-waktu-tunggu-gt-140.service'),
    extract: (summary) => {
      const num = summary.total_pasien_gt_140 !== undefined ? summary.total_pasien_gt_140 : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    }
  },
  {
    no: 54,
    id: 'dalam-menit-perpasien',
    nama: 'Jumlah Dalam Menit Perpasien ( - ) - Nama Modul: Waktu Tunggu Hasil Lab < 140 Menit',
    nama_modul: 'Jumlah Dalam Menit Perpasien',
    standar: '-',
    label_numerator: 'Total Waktu (Menit)',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator',
    service: require('./modules/laboratorium-waktu-tunggu-lt-140.service'),
    extract: (summary) => {
      const num = summary.total_waktu !== undefined ? summary.total_waktu : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    },
    calculateCapaian: (num, den) => den > 0 ? parseFloat((num / den).toFixed(2)) : 0
  },
  {
    no: 55,
    id: 'kerusakan-sample-lab',
    nama: 'Tidak Adanya Kerusakan Sampel di Laboratorium ( 100% ) - Nama Modul: Tidak Adanya Kerusakan Sampel',
    nama_modul: 'Tidak Adanya Kerusakan Sampel di Laboratorium',
    standar: '100%',
    label_numerator: 'Total Sampel Tidak Rusak',
    label_denominator: 'Total Data Pasien',
    formula: '(Total Pasien - Total Kerusakan) / Total Pasien * 100',
    service: require('./modules/laboratorium-kerusakan-sampel.service'),
    extract: (summary) => {
      const totPasien = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      const totKerusakan = summary.total_kerusakan !== undefined ? summary.total_kerusakan : 0;
      const num = Math.max(0, totPasien - totKerusakan);
      const den = totPasien;
      return { num, den };
    }
  },
  {
    no: 56,
    id: 'kesalahan-input-lab',
    nama: 'Tidak Adanya Kesalahan Input Data Hasil Pemeriksaan Lab ( 100% ) - Nama Modul: Tidak Adanya Kesalahan Input Lab',
    nama_modul: 'Tidak Adanya Kesalahan Input Data Hasil Pemeriksaan Lab',
    standar: '100%',
    label_numerator: 'Total Input Hasil Bebas Kesalahan',
    label_denominator: 'Total Data Pasien',
    formula: '(Total Pasien - Total Kesalahan) / Total Pasien * 100',
    service: require('./modules/laboratorium-kesalahan-input.service'),
    extract: (summary) => {
      const totPasien = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      const totSalah = summary.total_kesalahan !== undefined ? summary.total_kesalahan : 0;
      const num = Math.max(0, totPasien - totSalah);
      const den = totPasien;
      return { num, den };
    }
  },
  {
    no: 57,
    id: 'kepatuhan-identifikasi-lab',
    nama: 'Kepatuhan Identifikasi Pasien ( 100% ) - Nama Modul: Kepatuhan Identifikasi Pasien',
    nama_modul: 'Kepatuhan Identifikasi Pasien',
    standar: '100%',
    label_numerator: 'Total Pasien Teridentifikasi Tepat',
    label_denominator: 'Total Data Pasien',
    formula: 'Total Kepatuhan / Total Pasien * 100',
    service: require('./modules/laboratorium-kepatuhan-identifikasi.service'),
    extract: (summary) => {
      const num = summary.total_kepatuhan !== undefined ? summary.total_kepatuhan : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    }
  },
  {
    no: 58,
    id: 'ekpertisi-dokter-lab',
    nama: 'Ekspertisi Oleh Dokter Spesialis Patologi Klinik ( 100% ) - Nama Modul: Data Ekspertisi Oleh Dokter',
    nama_modul: 'Ekspertisi Oleh Dokter Spesialis Patologi Klinik',
    standar: '100%',
    label_numerator: 'Total Ekspertisi Oleh Dokter',
    label_denominator: 'Total Data Pasien',
    formula: 'Total Ekspertisi / Total Pasien * 100',
    service: require('./modules/laboratorium-ekspertisi-dokter.service'),
    extract: (summary) => {
      const num = summary.total_ekspertisi !== undefined ? summary.total_ekspertisi : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    }
  },
  {
    no: 59,
    id: 'kesalahan-penyerahan-hasil-lab',
    nama: 'Tidak Adanya Kesalahan Penyerahan Hasil Laboratorium ( 100% ) - Nama Modul: Kesalahan Penyerahan Hasil Lab',
    nama_modul: 'Tidak Adanya Kesalahan Penyerahan Hasil Laboratorium',
    standar: '100%',
    label_numerator: 'Total Pasien Tanpa Kesalahan',
    label_denominator: 'Total Data Pasien',
    formula: '(Total Pasien - Kesalahan) / Total Pasien * 100',
    service: require('./modules/laboratorium-kesalahan-penyerahan.service'),
    extract: (summary) => {
      const totPasien = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      const totSalah = summary.total_kesalahan !== undefined ? summary.total_kesalahan : 0;
      const num = Math.max(0, totPasien - totSalah);
      const den = totPasien;
      return { num, den };
    }
  },
  {
    no: 60,
    id: 'waktu-tunggu-sesuai-foto-thorax',
    nama: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Sesuai Jadwal) ( ≤ 3 Jam ) - Nama Modul: Waktu Tunggu Foto Thorax Sesuai Jadwal',
    nama_modul: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Sesuai Jadwal)',
    standar: '< 3 Jam',
    label_numerator: 'Total Data Waktu',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator',
    service: require('./modules/radiologi-thorax-sesuai-jadwal.service'),
    extract: (summary) => {
      const num = summary.total_waktu !== undefined ? summary.total_waktu : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    },
    calculateCapaian: (num, den) => den > 0 ? parseFloat((num / den).toFixed(2)) : 0
  },
  {
    no: 61,
    id: 'waktu-tunggu-diluar-foto-thorax',
    nama: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Diluar Jadwal) ( - ) - Nama Modul: Waktu Tunggu Foto Thorax Diluar Jadwal',
    nama_modul: 'Waktu Tunggu Hasil Pelayanan Foto Thorax (Diluar Jadwal)',
    standar: '> 3 Jam',
    label_numerator: 'Total Data Waktu',
    label_denominator: 'Total Data Pasien',
    formula: 'Numerator / Denumerator',
    service: require('./modules/radiologi-thorax-luar-jadwal.service'),
    extract: (summary) => {
      const num = summary.total_waktu !== undefined ? summary.total_waktu : 0;
      const den = summary.total_pasien !== undefined ? summary.total_pasien : 0;
      return { num, den };
    },
    calculateCapaian: (num, den) => den > 0 ? parseFloat((num / den).toFixed(2)) : 0
  },
  {
    no: 62,
    id: 'kepatuhan-identifikasi-pasien-radiologi',
    nama: 'Kepatuhan Identifikasi Pasien Radiologi ( 100% ) - Nama Modul: Kepatuhan Identifikasi Pasien Radiologi',
    nama_modul: 'Kepatuhan Identifikasi Pasien Radiologi',
    standar: '100%',
    label_numerator: 'Total Data (Di Lakukan)',
    label_denominator: 'Total Data (Di Lakukan) + (Tidak Dilakukan)',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/radiologi-identifikasi-pasien.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 63,
    id: 'kelengkapan-form-radiologi',
    nama: 'Kelengkapan Pengisian Form Info Tindakan Radiologi ( ≥ 85% ) - Nama Modul: Kelengkapan Form Info Tindakan Radiologi',
    nama_modul: 'Kelengkapan Pengisian Form Info Tindakan Radiologi',
    standar: '≥ 85%',
    label_numerator: 'Total Kepatuhan Pengisian',
    label_denominator: 'Total Pemeriksaan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/radiologi-info-tindakan.service'),
    extract: (summary) => {
      const num = summary.numerator !== undefined ? summary.numerator : 0;
      const den = summary.denominator !== undefined ? summary.denominator : 0;
      return { num, den };
    }
  },
  {
    no: 64,
    id: 'foto-ulang-pasien-radiologi',
    nama: 'Kejadian Foto Ulang Pasien ( - ) - Nama Modul: Kejadian Foto Ulang Pasien',
    nama_modul: 'Kejadian Foto Ulang Pasien',
    standar: '-',
    label_numerator: 'Total Kejadian',
    label_denominator: 'Total Pemeriksaan',
    formula: 'Numerator / Denumerator * 100',
    service: require('./modules/radiologi-foto-ulang.service'),
    extract: (summary) => {
      const num = summary.total_kejadian !== undefined ? summary.total_kejadian : 0;
      const den = summary.total_pemeriksaan !== undefined ? summary.total_pemeriksaan : 0;
      return { num, den };
    }
  }
];

function getActiveIndicatorsForRoom(room, roomConfig, kategori) {
  if (roomConfig && roomConfig.hasSaved) {
    const hasParentWaktuTunggu = roomConfig.set.has('waktu_tunggu_poliklinik') || roomConfig.set.has('waktu-tunggu-poliklinik');
    return ALL_INDICATOR_CONFIGS.filter(ind => {
      const isSavedActive = roomConfig.set.has(ind.id) || 
        roomConfig.set.has(ind.id.replace(/_/g, '-')) ||
        roomConfig.set.has(ind.id.replace(/-/g, '_')) ||
        (ind.id === 'jadwal-hemodialisa' && (roomConfig.set.has('ketidakpatuhan_hd') || roomConfig.set.has('jadwal_hemodialisa'))) ||
        (ind.id === 'insiden-clotting-durante' && (roomConfig.set.has('insiden_clotting') || roomConfig.set.has('insiden-clotting'))) ||
        (hasParentWaktuTunggu && ind.id.startsWith('waktu_tunggu_poliklinik'));

      if (isSavedActive) return true;

      if (roomConfig.allKnownIds && !roomConfig.allKnownIds.has(ind.id) && !roomConfig.allKnownIds.has(ind.id.replace(/_/g, '-')) && !roomConfig.allKnownIds.has(ind.id.replace(/-/g, '_'))) {
        const ai = AVAILABLE_INDICATORS.find(a => a.id === ind.id || a.id.replace(/_/g, '-') === ind.id.replace(/_/g, '-'));
        if (ai && ai.kategori_default) {
          const roomNama = (room.nama_unit || room.nama || '').toLowerCase();
          return ai.kategori_default.includes(room.kategori_unit) || 
                 ai.kategori_default.includes(kategori) || 
                 ai.kategori_default.some(k => roomNama.includes(k));
        }
      }
      return false;
    });
  }

  const defaultIds = new Set(
    AVAILABLE_INDICATORS
      .filter(ai => {
        if (!ai.kategori_default) return false;
        const roomNama = (room.nama_unit || room.nama || '').toLowerCase();
        return ai.kategori_default.includes(room.kategori_unit) || 
               ai.kategori_default.includes(kategori) ||
               ai.kategori_default.some(k => roomNama.includes(k));
      })
      .flatMap(ai => [ai.id, ai.id.replace(/_/g, '-'), ai.id.replace(/-/g, '_')])
  );

  if (defaultIds.size > 0) {
    return ALL_INDICATOR_CONFIGS.filter(ind => 
      defaultIds.has(ind.id) || 
      defaultIds.has(ind.id.replace(/_/g, '-')) || 
      defaultIds.has(ind.id.replace(/-/g, '_'))
    );
  }

  return ALL_INDICATOR_CONFIGS;
}

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

function calculateCapaian(numerator, denominator, ind = null) {
  if (ind && typeof ind.calculateCapaian === 'function') {
    return ind.calculateCapaian(numerator, denominator);
  }
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
      roomConfigMap[c.unit_id] = { set: new Set(), allKnownIds: new Set(), hasSaved: true };
    }
    roomConfigMap[c.unit_id].allKnownIds.add(c.indicator_id);
    if (c.aktif) {
      roomConfigMap[c.unit_id].set.add(c.indicator_id);
    }
  });

  // Process room data concurrently
  const roomResults = await Promise.all(
    rooms.map(async (room) => {
      const roomConfig = roomConfigMap[room.id];
      const activeIndicatorConfigs = getActiveIndicatorsForRoom(room, roomConfig, kategori)
        .map((ind, idx) => ({ ...ind, no: idx + 1 }));

      const indicators = await Promise.all(
        activeIndicatorConfigs.map(async (ind) => {
          const monthlyData = {};
          let totPeriodNum = 0;
          let totPeriodDen = 0;

          // Helper sums for Triwulan & Semester sub-aggregations
          let tw1Num = 0, tw1Den = 0;
          let tw2Num = 0, tw2Den = 0;

          const isAverageIndicator = (ind.label_numerator === '-' && ind.label_denominator === '-');
          let avgPeriodSum = 0, avgPeriodCount = 0;
          let avgTw1Sum = 0, avgTw1Count = 0;
          let avgTw2Sum = 0, avgTw2Count = 0;

          for (const bObj of bulanList) {
            const b = bObj.bulan;
            const pid = periodeMap[b];

            if (!pid) {
              monthlyData[b] = {
                numerator: isAverageIndicator ? '-' : 0,
                denominator: isAverageIndicator ? '-' : 0,
                capaian: 0
              };
              continue;
            }

            try {
              const queryWhere = { periode_id: pid, unit_id: room.id, ...(ind.extraWhere || {}) };
              const summary = await ind.service.getSummary(queryWhere);
              const extracted = await ind.extract(summary, queryWhere);
              const num = isAverageIndicator ? '-' : extracted.num;
              const den = isAverageIndicator ? '-' : extracted.den;
              const capaian = extracted.capaian !== undefined ? extracted.capaian : calculateCapaian(extracted.num, extracted.den, ind);

              monthlyData[b] = {
                numerator: num,
                denominator: den,
                capaian
              };

              if (isAverageIndicator) {
                if (capaian > 0) {
                  avgPeriodSum += capaian;
                  avgPeriodCount++;
                }
              } else {
                totPeriodNum += (typeof extracted.num === 'number' ? extracted.num : 0);
                totPeriodDen += (typeof extracted.den === 'number' ? extracted.den : 0);
              }

              // Categorize into TW1 and TW2 of the Semester
              if (isSemesterMode) {
                const firstHalfRange = startBulan === 1 ? [1, 2, 3] : [7, 8, 9];
                if (firstHalfRange.includes(b)) {
                  if (isAverageIndicator) {
                    if (capaian > 0) { avgTw1Sum += capaian; avgTw1Count++; }
                  } else {
                    tw1Num += (typeof extracted.num === 'number' ? extracted.num : 0);
                    tw1Den += (typeof extracted.den === 'number' ? extracted.den : 0);
                  }
                } else {
                  if (isAverageIndicator) {
                    if (capaian > 0) { avgTw2Sum += capaian; avgTw2Count++; }
                  } else {
                    tw2Num += (typeof extracted.num === 'number' ? extracted.num : 0);
                    tw2Den += (typeof extracted.den === 'number' ? extracted.den : 0);
                  }
                }
              }
            } catch (err) {
              console.error(`Error calculating summary for room ${room.nama_unit}, ind ${ind.id}, month ${b}:`, err.message);
              monthlyData[b] = {
                numerator: isAverageIndicator ? '-' : 0,
                denominator: isAverageIndicator ? '-' : 0,
                capaian: 0
              };
            }
          }

          const totCapaian = isAverageIndicator
            ? (avgPeriodCount > 0 ? parseFloat((avgPeriodSum / avgPeriodCount).toFixed(2)) : 0)
            : calculateCapaian(totPeriodNum, totPeriodDen, ind);

          const totalPeriode = {
            numerator: isAverageIndicator ? '-' : totPeriodNum,
            denominator: isAverageIndicator ? '-' : totPeriodDen,
            capaian: totCapaian
          };

          // Semester sub-aggregates
          let semesterBreakdown = null;
          if (isSemesterMode) {
            const tw1Label = startBulan === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
            const tw2Label = startBulan === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

            const tw1Capaian = isAverageIndicator
              ? (avgTw1Count > 0 ? parseFloat((avgTw1Sum / avgTw1Count).toFixed(2)) : 0)
              : calculateCapaian(tw1Num, tw1Den, ind);

            const tw2Capaian = isAverageIndicator
              ? (avgTw2Count > 0 ? parseFloat((avgTw2Sum / avgTw2Count).toFixed(2)) : 0)
              : calculateCapaian(tw2Num, tw2Den, ind);

            semesterBreakdown = {
              tw1: { label: tw1Label, numerator: isAverageIndicator ? '-' : tw1Num, denominator: isAverageIndicator ? '-' : tw1Den, capaian: tw1Capaian },
              tw2: { label: tw2Label, numerator: isAverageIndicator ? '-' : tw2Num, denominator: isAverageIndicator ? '-' : tw2Den, capaian: tw2Capaian },
              totalSemester: { label: semesterLabel, numerator: isAverageIndicator ? '-' : totPeriodNum, denominator: isAverageIndicator ? '-' : totPeriodDen, capaian: totCapaian }
            };
          }

          let displayName = ind.nama;
          let displayModul = ind.nama_modul;

          if (room && (room.nama_unit === 'ICU' || room.kode_unit === 'RK_ICU' || (room.nama_unit && room.nama_unit.toUpperCase().includes('ICU')))) {
            if (ind.id === 'angka_kematian_ranap' || ind.id === 'angka-kematian-ranap') {
              displayModul = 'Pasien Meninggal di ICU';
              displayName = `Pasien Meninggal di ICU ( ${ind.standar} ) - Nama Modul: Angka Kematian Ranap`;
            }
          }

          return {
            no: ind.no,
            id: ind.id,
            nama: displayName,
            nama_modul: displayModul,
            standar: ind.standar,
            label_numerator: ind.label_numerator,
            label_denominator: ind.label_denominator,
            formula: ind.formula,
            isCalculatedFromMenit: ind.isCalculatedFromMenit,
            monthlyData,
            totalPeriode,
            semesterBreakdown
          };
        })
      );

      // Post-process indicators that calculate Capaian from Menit (e.g., WT in Jam = Capaian Menit / 6)
      indicators.forEach(ind => {
        if (ind.isCalculatedFromMenit) {
          const menitInd = indicators.find(i => i.id === 'waktu_tunggu_poliklinik');
          if (menitInd) {
            bulanList.forEach(bObj => {
              const b = bObj.bulan;
              const mMenit = menitInd.monthlyData[b];
              const capJam = mMenit ? parseFloat((mMenit.capaian / 6).toFixed(2)) : 0;
              ind.monthlyData[b] = {
                numerator: null,
                denominator: 6,
                capaian: capJam
              };
            });

            const totCapJam = parseFloat((menitInd.totalPeriode.capaian / 6).toFixed(2));
            ind.totalPeriode = {
              numerator: null,
              denominator: 6,
              capaian: totCapJam
            };

            if (menitInd.semesterBreakdown && ind.semesterBreakdown) {
              ind.semesterBreakdown.tw1 = {
                label: menitInd.semesterBreakdown.tw1.label,
                numerator: null,
                denominator: 6,
                capaian: parseFloat((menitInd.semesterBreakdown.tw1.capaian / 6).toFixed(2))
              };
              ind.semesterBreakdown.tw2 = {
                label: menitInd.semesterBreakdown.tw2.label,
                numerator: null,
                denominator: 6,
                capaian: parseFloat((menitInd.semesterBreakdown.tw2.capaian / 6).toFixed(2))
              };
              ind.semesterBreakdown.totalSemester = {
                label: menitInd.semesterBreakdown.totalSemester.label,
                numerator: null,
                denominator: 6,
                capaian: parseFloat((menitInd.semesterBreakdown.totalSemester.capaian / 6).toFixed(2))
              };
            }
          }
        }
      });

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
    const rawatInapInds = getActiveIndicatorsForRoom({ kategori_unit: 'rawat_inap' }, null, 'rawat_inap')
      .map((ind, idx) => ({ ...ind, no: idx + 1 }));
    totalRs = rawatInapInds.map(ind => {
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

      const totCapaian = calculateCapaian(totNum, totDen, ind);
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
      capaian: calculateCapaian(rsPeriodNum, rsPeriodDen, ind)
    };

    let semesterBreakdown = null;
    if (isSemesterMode) {
      const tw1Label = startBulan === 1 ? 'TOTAL TRIWULAN I' : 'TOTAL TRIWULAN III';
      const tw2Label = startBulan === 1 ? 'TOTAL TRIWULAN II' : 'TOTAL TRIWULAN IV';

      semesterBreakdown = {
        tw1: { label: tw1Label, numerator: rsTw1Num, denominator: rsTw1Den, capaian: calculateCapaian(rsTw1Num, rsTw1Den, ind) },
        tw2: { label: tw2Label, numerator: rsTw2Num, denominator: rsTw2Den, capaian: calculateCapaian(rsTw2Num, rsTw2Den, ind) },
        totalSemester: { label: semesterLabel, numerator: rsPeriodNum, denominator: rsPeriodDen, capaian: calculateCapaian(rsPeriodNum, rsPeriodDen, ind) }
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
      const stdSuffix = (ind.standar && ind.standar !== '-' && !ind.nama_modul.includes(ind.standar)) ? ` (${ind.standar})` : '';
      row.getCell(3).value = `${ind.nama_modul}${stdSuffix}`;
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

      const rsStdSuffix = (ind.standar && ind.standar !== '-' && !ind.nama_modul.includes(ind.standar)) ? ` (${ind.standar})` : '';
      row.getCell(3).value = `${ind.nama_modul}${rsStdSuffix}`;
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

  // Set default font to Arial for all cells in the worksheet
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.font = {
        name: 'Arial',
        ...(cell.font || {})
      };
    });
  });

  return wb;
}

module.exports = {
  getRekapMutuData,
  exportRekapMutuExcel,
};
