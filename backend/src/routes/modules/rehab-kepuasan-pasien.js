const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/rehab-kepuasan-pasien.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('nilai_maksimal').isInt({ min: 1 }).withMessage('Nilai maksimal kuisioner harus berupa angka positif'),
  body('hasil_kuisioner').isInt({ min: 0 }).withMessage('Hasil kuisioner harus berupa angka non-negatif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  body('tanggal').optional().isISO8601().withMessage('Tanggal tidak valid'),
  body('nama_pasien').optional().notEmpty().withMessage('Nama pasien wajib diisi'),
  body('nilai_maksimal').optional().isInt({ min: 1 }).withMessage('Nilai maksimal kuisioner harus berupa angka positif'),
  body('hasil_kuisioner').optional().isInt({ min: 0 }).withMessage('Hasil kuisioner harus berupa angka non-negatif'),
], [
  (req, res, next) => {
    if (req.body.tanggal) req.body.tanggal = new Date(req.body.tanggal);
    next();
  }
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
