const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/waktu-tunggu-operasi.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi').isLength({ max: 20 }).withMessage('No RM maksimal 20 karakter'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi').isLength({ max: 100 }).withMessage('Nama pasien maksimal 100 karakter'),
  body('diagnosa').notEmpty().withMessage('Diagnosa wajib diisi').isLength({ max: 255 }).withMessage('Diagnosa maksimal 255 karakter'),
  body('tanggal_penjadwalan').notEmpty().withMessage('Tanggal penjadwalan wajib diisi'),
  body('tanggal_operasi').notEmpty().withMessage('Tanggal operasi wajib diisi'),
], validate, ctrl.create);

router.put('/:id', [
  body('periode_id').optional().isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').optional().isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').optional().notEmpty().withMessage('Tanggal wajib diisi'),
  body('no_rm').optional().notEmpty().withMessage('No RM wajib diisi').isLength({ max: 20 }).withMessage('No RM maksimal 20 karakter'),
  body('nama_pasien').optional().notEmpty().withMessage('Nama pasien wajib diisi').isLength({ max: 100 }).withMessage('Nama pasien maksimal 100 karakter'),
  body('diagnosa').optional().notEmpty().withMessage('Diagnosa wajib diisi').isLength({ max: 255 }).withMessage('Diagnosa maksimal 255 karakter'),
  body('tanggal_penjadwalan').optional().notEmpty().withMessage('Tanggal penjadwalan wajib diisi'),
  body('tanggal_operasi').optional().notEmpty().withMessage('Tanggal operasi wajib diisi'),
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
