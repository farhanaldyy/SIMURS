const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/kepatuhan-kebersihan-tangan.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('profesi').isIn(['dokter', 'perawat', 'bidan', 'nakes_lain']).withMessage('Profesi tidak valid'),
  body('tindakan').isIn(['hr', 'hw', 'hr_hw', 'missed']).withMessage('Tindakan tidak valid'),
  body('gloves').optional().isBoolean().withMessage('Gloves tidak valid'),
  body('tindakan_id').optional({ checkFalsy: true }).isInt().withMessage('Tindakan Master tidak valid'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('profesi').optional().isIn(['dokter', 'perawat', 'bidan', 'nakes_lain']).withMessage('Profesi tidak valid'),
  body('tindakan').optional().isIn(['hr', 'hw', 'hr_hw', 'missed']).withMessage('Tindakan tidak valid'),
  body('gloves').optional().isBoolean().withMessage('Gloves tidak valid'),
  body('tindakan_id').optional({ checkFalsy: true }).isInt().withMessage('Tindakan Master tidak valid'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
