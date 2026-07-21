const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/gizi-waktu-makanan.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_tepat_waktu').isInt({ min: 0 }).withMessage('Jumlah tepat waktu harus berupa angka non-negatif'),
  body('jumlah_porsi').isInt({ min: 1 }).withMessage('Jumlah porsi harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_tepat_waktu').optional().isInt({ min: 0 }).withMessage('Jumlah tepat waktu harus berupa angka non-negatif'),
  body('jumlah_porsi').optional().isInt({ min: 1 }).withMessage('Jumlah porsi harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
