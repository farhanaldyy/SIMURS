const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/radiologi-foto-ulang.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('over_exposure').isInt({ min: 0 }).withMessage('Over exposure wajib berupa angka'),
  body('under_exposure').isInt({ min: 0 }).withMessage('Under exposure wajib berupa angka'),
  body('positioning').isInt({ min: 0 }).withMessage('Positioning wajib berupa angka'),
  body('artefac').isInt({ min: 0 }).withMessage('Artefac wajib berupa angka'),
  body('equitmen').isInt({ min: 0 }).withMessage('Equitmen wajib berupa angka'),
  body('jumlah_pemeriksaan').isInt({ min: 1 }).withMessage('Jumlah pemeriksaan wajib diisi minimal 1'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
