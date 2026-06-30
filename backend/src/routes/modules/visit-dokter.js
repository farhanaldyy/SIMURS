const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/visit-dokter.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_dpjp').notEmpty().withMessage('Nama DPJP wajib diisi'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('jam_mulai_selesai').notEmpty().withMessage('Jam mulai-selesai wajib diisi'),
  body('jam_visit').notEmpty().withMessage('Jam visit wajib diisi'),
  body('kategori_visit').isIn(['cepat', 'tepat_waktu', 'terlambat', 'sangat_terlambat', 'tidak_visit']).withMessage('Kategori tidak valid'),
], [
  (req, res, next) => {
    if (req.body.jam_visit) {
      const jam = req.body.jam_visit.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_visit = d;
    }
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.jam_visit) {
      const jam = req.body.jam_visit.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_visit = d;
    }
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
