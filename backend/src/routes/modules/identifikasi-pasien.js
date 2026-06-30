const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/identifikasi-pasien.controller');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

const vals = ['dilakukan', 'tidak dilakukan', 'tidak_dilakukan', 'tidak ada peluang', 'tidak_ada_peluang'];
router.post('/', [
  body('periode_id').isInt(), body('unit_id').isInt(),
  body('tanggal').isDate(), body('nama_pasien').notEmpty(), body('no_rm').notEmpty(),
  body('pemberian_obat').isIn(vals), body('nutrisi_ngt').isIn(vals),
  body('pemberian_darah').isIn(vals), body('tindakan_keperawatan').isIn(vals),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
