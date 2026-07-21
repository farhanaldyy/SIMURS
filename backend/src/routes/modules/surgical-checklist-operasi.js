const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/surgical-checklist-operasi.controller');

router.use(verifyToken);

router.get('/', (req, res, next) => { req.query.jenis = 'operasi_umum'; next(); }, ctrl.getAll);
router.get('/summary', (req, res, next) => { req.query.jenis = 'operasi_umum'; next(); }, ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('dpjp').notEmpty().withMessage('DPJP wajib diisi'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('sign_in').isBoolean().withMessage('Sign in tidak valid'),
  body('time_out').isBoolean().withMessage('Time out tidak valid'),
  body('sign_out').isBoolean().withMessage('Sign out tidak valid'),
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
