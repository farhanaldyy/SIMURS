// SIMURS Module configuration
export const NAV_GROUPS = [
  {
    title: '📊 Dashboard & Laporan',
    items: [
      { label: 'Dashboard', hash: '#/dashboard' },
      { label: 'Cetak Laporan', hash: '#/laporan' },
      { label: 'Daftar Modul', hash: '#/modul' }
    ],
  },
  {
    title: '🛡️ Keselamatan Pasien',
    items: [
      { label: 'Risiko Jatuh', hash: '#/risiko-jatuh' },
      { label: 'Insiden Keselamatan', hash: '#/insiden-keselamatan' },
      { label: 'Identifikasi Pasien', hash: '#/identifikasi-pasien' },
      { label: 'Reaksi Transfusi', hash: '#/reaksi-transfusi' },
      { label: 'Gelang Identitas', hash: '#/gelang-identitas' },
      { label: 'Kepatuhan Kebersihan Tangan', hash: '#/kepatuhan-kebersihan-tangan' },
      { label: 'Kepatuhan Penggunaan APD', hash: '#/kepatuhan-apd' },
    ],
  },
  {
    title: '🏥 Rawat Inap',
    items: [
      { label: 'Angka Kematian Ranap', hash: '#/angka-kematian-ranap' },
      { label: 'Double Check High Alert', hash: '#/double-check-high-alert' },
      { label: 'Visit Dokter Spesialis', hash: '#/visit-dokter' },
      { label: 'Kembali ICU', hash: '#/kembali-icu' },
      { label: 'Alur Klinis', hash: '#/alur-klinis' },
    ],
  },
  {
    title: '🚨 IGD',
    items: [
      { label: 'Waktu Tanggap SC', hash: '#/waktu-tanggap-sc' },
      { label: 'Emergency Response Time', hash: '#/emergency-response-time' },
      { label: 'Angka Kematian IGD', hash: '#/angka-kematian-igd' },
      { label: 'Asesmen Awal IGD', hash: '#/asesmen-awal-igd' },
      { label: 'Pasien Tertahan IGD', hash: '#/pasien-tertahan-igd' },
      { label: 'Serah Terima Pasien', hash: '#/serah-terima-pasien' },
    ],
  },
  {
    title: '💉 Hemodialisa',
    items: [
      { label: 'Ketidakpatuhan Pasien HD', hash: '#/ketidakpatuhan-hd' },
      { label: 'Insiden Clotting HD', hash: '#/insiden-clotting' },
      { label: 'Insiden Jarum Vena HD', hash: '#/insiden-jarum-vena' },
    ],
  },
  {
    title: '🔪 Operasi & Anestesi',
    items: [
      { label: 'Penundaan Operasi Elektif', hash: '#/penundaan-operasi' },
      { label: 'Informed Consent Bedah', hash: '#/informed-consent-pembedahan' },
      { label: 'Informed Consent Anestesi', hash: '#/informed-consent-anestesi' },
      { label: 'Asesmen Pra Bedah', hash: '#/asesmen-pra-bedah' },
      { label: 'Asesmen Pra Anestesi', hash: '#/asesmen-pra-anestesi' },
      { label: 'Surgical Safety Checklist SC', hash: '#/surgical-checklist-sc' },
      { label: 'Surgical Safety Checklist Op', hash: '#/surgical-checklist-operasi' },
      { label: 'Penandaan Lokasi Operasi', hash: '#/penandaan-lokasi-operasi' },
      { label: 'Standar Minimal Mutu Kamar Operasi', hash: '#/mutu-kamar-operasi' },
    ],
  },
  {
    title: '🥗 Gizi',
    items: [
      { label: 'Ketepatan Waktu Makanan', hash: '#/gizi-waktu-makanan' },
      { label: 'Sisa Makanan Pasien', hash: '#/gizi-sisa-makanan' },
      { label: 'Akurasi Pemberian Diet', hash: '#/gizi-kesalahan-diet' },
      { label: 'Identifikasi Pasien SIMRS', hash: '#/gizi-identifikasi-pasien' },
    ],
  },
  {
    title: '🚶 Rawat Jalan',
    items: [
      { label: 'Waktu Tunggu Poliklinik', hash: '#/waktu-tunggu-poliklinik' },
      { label: 'Waktu Tunggu Operasi Elektif', hash: '#/waktu-tunggu-operasi-elektif' },
    ],
  },
  {
    title: '📁 Rekam Medis',
    items: [
      { label: 'Standar Minimal Mutu Rekam Medis', hash: '#/mutu-rekam-medis' },
    ],
  },
  {
    title: '♿ Rehabilitasi Medis',
    items: [
      { label: 'Drop Out Pasien', hash: '#/rehab-drop-out' },
      { label: 'Kesalahan Tindakan', hash: '#/rehab-kesalahan-tindakan' },
      { label: 'Waktu Tunggu Pelayanan', hash: '#/rehab-waktu-tunggu' },
      { label: 'Kepatuhan Identitas', hash: '#/rehab-kepatuhan-identitas' },
      { label: 'Kepuasan Pasien', hash: '#/rehab-kepuasan-pasien' },
    ],
  },
  {
    title: '🧺 Laundry',
    items: [
      { label: 'Ketepatan Waktu Linen', hash: '#/laundry-ketepatan-linen' },
      { label: 'Kejadian Linen Hilang', hash: '#/laundry-linen-hilang' },
    ],
  },
  {
    title: '🩻 Radiologi',
    items: [
      { label: 'Jadwal Dokter', hash: '#/radiologi-jadwal-dokter' },
      { label: 'Thorax Sesuai Jadwal', hash: '#/radiologi-thorax-sesuai-jadwal' },
      { label: 'Thorax Luar Jadwal', hash: '#/radiologi-thorax-luar-jadwal' },
      { label: 'Kejadian Foto Ulang', hash: '#/radiologi-foto-ulang' },
      { label: 'Kelengkapan Info Tindakan', hash: '#/radiologi-info-tindakan' },
      { label: 'Kepatuhan Identifikasi Pasien', hash: '#/radiologi-identifikasi-pasien' },
    ],
  },
  {
    title: '🔬 Laboratorium',
    items: [
      { label: 'Jadwal Dokter', hash: '#/laboratorium-jadwal-dokter' },
      { label: 'Waktu Tunggu Lab < 140 Menit', hash: '#/laboratorium-waktu-tunggu-lt-140' },
      { label: 'Waktu Tunggu Lab > 140 Menit', hash: '#/laboratorium-waktu-tunggu-gt-140' },
      { label: 'Pelaporan Hasil Kritis ≤ 30 Menit', hash: '#/laboratorium-hasil-kritis' },
      { label: 'Tidak Adanya Kesalahan Input Lab', hash: '#/laboratorium-kesalahan-input' },
      { label: 'Tidak Adanya Kerusakan Sampel', hash: '#/laboratorium-kerusakan-sampel' },
      { label: 'Kepatuhan Identifikasi Pasien', hash: '#/laboratorium-kepatuhan-identifikasi' },
      { label: 'Data Ekspertisi Oleh Dokter', hash: '#/laboratorium-ekspertisi-dokter' },
    ],
  },
  {
    title: '💊 Farmasi',
    items: [
      { label: 'Standar Minimal Mutu Farmasi', hash: '#/mutu-farmasi' },
      { label: 'Kesalahan Penyerahan Obat', hash: '#/kesalahan-penyerahan-obat' },
      { label: 'Kepatuhan Formularium Nasional', hash: '#/kepatuhan-formularium-nasional' }
    ]
  },
  {
    title: '💻 SIMRS',
    items: [
      { label: 'Response Time SIMRS IT', hash: '#/simrs-response-time-it' }
    ],
  },
  {
    title: '⚙️ Master Data',
    items: [
      { label: 'Master Tindakan', hash: '#/master-tindakan' },
      { label: 'Master Poliklinik', hash: '#/master-poliklinik' }
    ],
  },
];

export const ADMIN_GROUP = {
  title: '⚙️ Admin',
  items: [
    { label: 'Kelola User', hash: '#/admin/users' },
    { label: 'Kelola Unit', hash: '#/admin/units' },
    { label: 'Kelola Periode', hash: '#/admin/periode' },
    { label: 'Audit Trail', hash: '#/admin/audit-log' },
  ],
};
