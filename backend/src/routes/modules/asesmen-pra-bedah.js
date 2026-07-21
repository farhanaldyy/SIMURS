const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/asesmen-pra-bedah.controller');

router.use(verifyToken);

router.get('/', (req, res, next) => { req.query.jenis = 'pra_bedah'; next(); }, ctrl.getAll);
router.get('/summary', (req, res, next) => { req.query.jenis = 'pra_bedah'; next(); }, ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('dpjp').notEmpty().withMessage('DPJP wajib diisi'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('diisi').isBoolean().withMessage('Nilai diisi tidak valid'),
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
