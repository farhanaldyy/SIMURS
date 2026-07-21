const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/rehab-waktu-tunggu.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_pasien').isInt({ min: 0 }).withMessage('Jumlah pasien harus berupa angka non-negatif'),
  body('waktu_tunggu_gt_60').isInt({ min: 0 }).withMessage('Waktu tunggu > 60 menit harus berupa angka non-negatif'),
  body('waktu_tunggu_lt_60').isInt({ min: 0 }).withMessage('Waktu tunggu < 60 menit harus berupa angka non-negatif'),
  body('total_waktu_tunggu').isInt({ min: 0 }).withMessage('Total waktu tunggu harus berupa angka non-negatif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_pasien').optional().isInt({ min: 0 }).withMessage('Jumlah pasien harus berupa angka non-negatif'),
  body('waktu_tunggu_gt_60').optional().isInt({ min: 0 }).withMessage('Waktu tunggu > 60 menit harus berupa angka non-negatif'),
  body('waktu_tunggu_lt_60').optional().isInt({ min: 0 }).withMessage('Waktu tunggu < 60 menit harus berupa angka non-negatif'),
  body('total_waktu_tunggu').optional().isInt({ min: 0 }).withMessage('Total waktu tunggu harus berupa angka non-negatif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
