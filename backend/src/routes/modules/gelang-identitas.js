const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/gelang-identitas.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('gelang_identitas').isIn(['dilakukan', 'tidak dilakukan']).withMessage('Nilai tidak valid'),
  body('alergi').isIn(['dilakukan', 'tidak dilakukan']).withMessage('Nilai tidak valid'),
  body('fall_risk').isIn(['dilakukan', 'tidak dilakukan']).withMessage('Nilai tidak valid'),
  body('dnr').isIn(['dilakukan', 'tidak dilakukan']).withMessage('Nilai tidak valid'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
