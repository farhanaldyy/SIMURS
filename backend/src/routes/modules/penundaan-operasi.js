const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/penundaan-operasi.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);
router.get('/summary-data', ctrl.getSummaryData);
router.post('/summary-data', [
  body('periode_id').isInt().withMessage('Periode ID wajib disertakan'),
  body('standar_menit').isInt().withMessage('Batas waktu penundaan wajib berupa angka integer'),
], validate, ctrl.upsertSummaryData);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('dpjp').notEmpty().withMessage('DPJP wajib diisi'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('jadwal_jam_operasi').notEmpty().withMessage('Jadwal jam operasi wajib diisi'),
  body('jam_mulai_operasi').notEmpty().withMessage('Jam mulai operasi wajib diisi'),
  body('batal').optional().isBoolean().withMessage('Nilai batal tidak valid'),
  body('indikasi_medis').optional().isBoolean().withMessage('Nilai indikasi medis tidak valid'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    if (req.body.jadwal_jam_operasi) {
      const jam = req.body.jadwal_jam_operasi.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jadwal_jam_operasi = d;
    }
    if (req.body.jam_mulai_operasi) {
      const jam = req.body.jam_mulai_operasi.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_mulai_operasi = d;
    }
    if (req.body.batal !== undefined) {
      req.body.batal = req.body.batal === true || req.body.batal === 'true';
    }
    if (req.body.indikasi_medis !== undefined) {
      req.body.indikasi_medis = req.body.indikasi_medis === true || req.body.indikasi_medis === 'true';
    }
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    if (req.body.jadwal_jam_operasi) {
      const jam = req.body.jadwal_jam_operasi.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jadwal_jam_operasi = d;
    }
    if (req.body.jam_mulai_operasi) {
      const jam = req.body.jam_mulai_operasi.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_mulai_operasi = d;
    }
    if (req.body.batal !== undefined) {
      req.body.batal = req.body.batal === true || req.body.batal === 'true';
    }
    if (req.body.indikasi_medis !== undefined) {
      req.body.indikasi_medis = req.body.indikasi_medis === true || req.body.indikasi_medis === 'true';
    }
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
