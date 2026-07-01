const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/ketidakpatuhan-hd.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);
router.get('/summary-data', ctrl.getSummaryData);
router.post('/summary-data', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('total_pasien_hd').optional().isInt({ min: 0 }).withMessage('Total pasien HD harus berupa angka positif'),
  body('total_avgraft_avf').optional().isInt({ min: 0 }).withMessage('Jumlah pasien dengan Avgraft/AVF harus berupa angka positif'),
], validate, ctrl.upsertSummaryData);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('jadwal_hd_per_minggu').notEmpty().withMessage('Jadwal HD wajib diisi'),
  body('hari_tidak_datang').notEmpty().withMessage('Hari tidak datang wajib diisi'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
