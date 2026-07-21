const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/insiden-jarum-vena.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);
router.get('/summary-data', ctrl.getSummaryData);
router.post('/summary-data', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
], validate, ctrl.upsertSummaryData);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('tanggal_kejadian').isISO8601().withMessage('Tanggal kejadian tidak valid'),
  body('perawat_pemasang').notEmpty().withMessage('Nama perawat pemasang wajib diisi'),
], [
  (req, res, next) => {
    if (req.body.tanggal_kejadian) req.body.tanggal_kejadian = new Date(req.body.tanggal_kejadian);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.tanggal_kejadian) req.body.tanggal_kejadian = new Date(req.body.tanggal_kejadian);
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
