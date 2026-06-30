const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/waktu-tanggap-sc.controller');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt(), body('unit_id').isInt(),
  body('nama_pasien').notEmpty(), body('no_rm').notEmpty(), body('diagnosis').notEmpty(),
  body('jam_ditentukan_operasi').notEmpty(), body('jam_sayatan_pertama').notEmpty(),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
