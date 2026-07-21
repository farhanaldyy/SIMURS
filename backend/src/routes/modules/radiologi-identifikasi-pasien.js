const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/radiologi-identifikasi-pasien.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('pemberian_obat').notEmpty().withMessage('Pemberian obat wajib diisi'),
  body('pemberian_nutrisi').notEmpty().withMessage('Pemberian nutrisi wajib diisi'),
  body('pemberian_darah').notEmpty().withMessage('Pemberian darah wajib diisi'),
  body('pengambilan_spesimen').notEmpty().withMessage('Pengambilan spesimen wajib diisi'),
  body('melakukan_tindakan').notEmpty().withMessage('Melakukan tindakan wajib diisi'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
