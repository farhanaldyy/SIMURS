const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/emergency-response-time.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('jam_datang').notEmpty().withMessage('Jam datang wajib diisi'),
  body('jam_dilayani_dokter').notEmpty().withMessage('Jam dilayani dokter wajib diisi'),
  body('triase').isIn(['Merah', 'Kuning', 'Hijau', 'Hitam']).withMessage('Triase tidak valid'),
], [
  (req, res, next) => {
    if (req.body.jam_datang) {
      const jam = req.body.jam_datang.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_datang = d;
    }
    if (req.body.jam_dilayani_dokter) {
      const jam = req.body.jam_dilayani_dokter.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_dilayani_dokter = d;
    }
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.jam_datang) {
      const jam = req.body.jam_datang.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_datang = d;
    }
    if (req.body.jam_dilayani_dokter) {
      const jam = req.body.jam_dilayani_dokter.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_dilayani_dokter = d;
    }
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
