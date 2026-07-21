const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/laboratorium-hasil-kritis.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('nilai_kritis').isInt({ min: 0 }).withMessage('Nilai Kritis wajib berupa angka'),
  body('lt_30').isInt({ min: 0 }).withMessage('Jumlah < 30 Menit wajib berupa angka'),
  body('gt_30').isInt({ min: 0 }).withMessage('Jumlah > 30 Menit wajib berupa angka'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
