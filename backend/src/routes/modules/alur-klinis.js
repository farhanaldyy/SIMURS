const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/alur-klinis.controller');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

const sesuaiVals = ['sesuai', 'tidak sesuai', 'tidak_sesuai'];
router.post('/', [
  body('periode_id').isInt(), body('unit_id').isInt(),
  body('nama_pasien').notEmpty(), body('no_rm').notEmpty(),
  body('diagnosis').notEmpty(), body('ruangan').notEmpty(), body('bulan').notEmpty(),
  body('los').isIn(sesuaiVals), body('penunjang').isIn(sesuaiVals), body('obat').isIn(sesuaiVals),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
