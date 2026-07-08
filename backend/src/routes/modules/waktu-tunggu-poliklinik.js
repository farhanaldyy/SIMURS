const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/waktu-tunggu-poliklinik.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('poli_id').isInt().withMessage('Poliklinik wajib dipilih'),
  body('jumlah_pasien').isInt({ min: 0 }).withMessage('Jumlah pasien wajib berupa angka positif'),
  body('waktu_tunggu').isNumeric().withMessage('Waktu tunggu wajib berupa angka'),
], validate, ctrl.create);

router.put('/:id', [
  body('periode_id').optional().isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').optional().isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').optional().notEmpty().withMessage('Tanggal wajib diisi'),
  body('poli_id').optional().isInt().withMessage('Poliklinik wajib dipilih'),
  body('jumlah_pasien').optional().isInt({ min: 0 }).withMessage('Jumlah pasien wajib berupa angka positif'),
  body('waktu_tunggu').optional().isNumeric().withMessage('Waktu tunggu wajib berupa angka'),
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
