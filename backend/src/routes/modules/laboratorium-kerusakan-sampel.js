const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/laboratorium-kerusakan-sampel.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('jumlah_pasien').isInt({ min: 0 }).withMessage('Jumlah pasien wajib berupa angka'),
  body('jumlah_kerusakan').isInt({ min: 0 }).withMessage('Jumlah kerusakan sampel wajib berupa angka'),
  body('keterangan').optional({ checkFalsy: true }).isString(),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
