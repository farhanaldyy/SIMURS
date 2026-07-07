const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/gizi-identifikasi-pasien.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_sesuai').isInt({ min: 0 }).withMessage('Jumlah penulisan sesuai harus berupa angka non-negatif'),
  body('jumlah_pasien_ranap').isInt({ min: 1 }).withMessage('Jumlah pasien ranap harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_sesuai').optional().isInt({ min: 0 }).withMessage('Jumlah penulisan sesuai harus berupa angka non-negatif'),
  body('jumlah_pasien_ranap').optional().isInt({ min: 1 }).withMessage('Jumlah pasien ranap harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
