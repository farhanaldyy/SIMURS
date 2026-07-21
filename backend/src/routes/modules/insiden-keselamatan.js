const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/insiden-keselamatan.controller');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt(), body('unit_id').isInt(),
  body('tanggal_kejadian').isDate(), body('jam_kejadian').notEmpty(),
  body('nama_pasien').notEmpty(), body('no_rm').notEmpty(),
  body('deskripsi_insiden').notEmpty(),
  body('jenis_insiden').isIn(['KTD', 'KNC', 'KPC', 'Sentinel', 'KTC']),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
