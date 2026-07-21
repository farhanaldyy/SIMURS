const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/penandaan-lokasi-operasi.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('diagnosis').notEmpty().withMessage('Diagnosis wajib diisi'),
  body('dpjp').notEmpty().withMessage('DPJP wajib diisi'),
  body('dilakukan').isBoolean().withMessage('Nilai dilakukan tidak valid'),
  body('not_applicable').isBoolean().withMessage('Nilai not applicable tidak valid'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
