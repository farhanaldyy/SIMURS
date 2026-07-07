// SIMURS Module configuration
export const NAV_GROUPS = [
  {
    title: '📊 Dashboard & Laporan',
    items: [
      { label: 'Dashboard', hash: '#/dashboard' },
      { label: 'Cetak Laporan', hash: '#/laporan' }
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
