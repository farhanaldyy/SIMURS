const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/kesalahan-penyerahan-obat.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('resep_rajal').isInt({ min: 0 }),
  body('resep_ranap').isInt({ min: 0 }),
  body('resep_igd').isInt({ min: 0 }),
  body('salah_rajal').isInt({ min: 0 }),
  body('salah_ranap').isInt({ min: 0 }),
  body('salah_igd').isInt({ min: 0 }),
], validate, ctrl.upsert);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
