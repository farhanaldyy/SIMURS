const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/gizi-kesalahan-diet.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_tidak_salah').isInt({ min: 0 }).withMessage('Jumlah tidak salah harus berupa angka non-negatif'),
  body('jumlah_porsi').isInt({ min: 1 }).withMessage('Jumlah porsi harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('jumlah_tidak_salah').optional().isInt({ min: 0 }).withMessage('Jumlah tidak salah harus berupa angka non-negatif'),
  body('jumlah_porsi').optional().isInt({ min: 1 }).withMessage('Jumlah porsi harus berupa angka positif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
