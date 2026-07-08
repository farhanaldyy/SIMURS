const router = require('express').Router();

// Auth
router.use('/auth', require('./auth'));

// Master data
router.use('/', require('./master'));
router.use('/master-tindakan', require('./modules/master-tindakan'));
router.use('/master-poliklinik', require('./modules/master-poliklinik'));

// Rawat Jalan / Outpatient modules
router.use('/waktu-tunggu-poliklinik', require('./modules/waktu-tunggu-poliklinik'));
router.use('/waktu-tunggu-operasi', require('./modules/waktu-tunggu-operasi'));

// Dashboard
router.use('/dashboard', require('./dashboard'));

// Laporan / Reports
router.use('/laporan', require('./laporan'));

// Indicator modules (Phase 1)
router.use('/risiko-jatuh', require('./modules/risiko-jatuh'));
router.use('/identifikasi-pasien', require('./modules/identifikasi-pasien'));
router.use('/insiden-keselamatan', require('./modules/insiden-keselamatan'));
router.use('/waktu-tanggap-sc', require('./modules/waktu-tanggap-sc'));
router.use('/alur-klinis', require('./modules/alur-klinis'));

// Indicator modules (Phase 2)
router.use('/reaksi-transfusi', require('./modules/reaksi-transfusi'));
router.use('/gelang-identitas', require('./modules/gelang-identitas'));
router.use('/serah-terima-pasien', require('./modules/serah-terima-pasien'));
router.use('/angka-kematian-ranap', require('./modules/angka-kematian-ranap'));
router.use('/double-check-high-alert', require('./modules/double-check-high-alert'));
router.use('/visit-dokter', require('./modules/visit-dokter'));
router.use('/kembali-icu', require('./modules/kembali-icu'));
router.use('/emergency-response-time', require('./modules/emergency-response-time'));
router.use('/angka-kematian-igd', require('./modules/angka-kematian-igd'));
router.use('/asesmen-awal-igd', require('./modules/asesmen-awal-igd'));
router.use('/pasien-tertahan-igd', require('./modules/pasien-tertahan-igd'));
router.use('/ketidakpatuhan-hd', require('./modules/ketidakpatuhan-hd'));
router.use('/insiden-clotting', require('./modules/insiden-clotting'));
router.use('/insiden-jarum-vena', require('./modules/insiden-jarum-vena'));
router.use('/penundaan-operasi', require('./modules/penundaan-operasi'));
router.use('/informed-consent-pembedahan', require('./modules/informed-consent-pembedahan'));
router.use('/informed-consent-anestesi', require('./modules/informed-consent-anestesi'));
router.use('/asesmen-pra-bedah', require('./modules/asesmen-pra-bedah'));
router.use('/asesmen-pra-anestesi', require('./modules/asesmen-pra-anestesi'));
router.use('/surgical-checklist-sc', require('./modules/surgical-checklist-sc'));
router.use('/surgical-checklist-operasi', require('./modules/surgical-checklist-operasi'));
router.use('/penandaan-lokasi-operasi', require('./modules/penandaan-lokasi-operasi'));
router.use('/mutu-kamar-operasi', require('./modules/mutu-kamar-operasi'));

// Gizi modules
router.use('/gizi-waktu-makanan', require('./modules/gizi-waktu-makanan'));
router.use('/gizi-sisa-makanan', require('./modules/gizi-sisa-makanan'));
router.use('/gizi-kesalahan-diet', require('./modules/gizi-kesalahan-diet'));
router.use('/gizi-identifikasi-pasien', require('./modules/gizi-identifikasi-pasien'));
router.use('/kepatuhan-kebersihan-tangan', require('./modules/kepatuhan-kebersihan-tangan'));
router.use('/kepatuhan-apd', require('./modules/kepatuhan-apd'));

module.exports = router;
