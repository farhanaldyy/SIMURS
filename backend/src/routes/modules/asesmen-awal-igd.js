const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/asesmen-awal-igd.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('anamnesis').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('Anamnesis tidak valid'),
  body('ttv').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('TTV tidak valid'),
  body('tb').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('TB tidak valid'),
  body('bb').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('BB tidak valid'),
  body('diagnosis').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('Diagnosis tidak valid'),
  body('terapi').isIn(['ada', 'tidak ada', 'tidak_ada']).withMessage('Terapi tidak valid'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
