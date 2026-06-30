const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/pasien-tertahan-igd.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('jam_masuk').notEmpty().withMessage('Jam masuk wajib diisi'),
  body('jam_pindah_ruangan').notEmpty().withMessage('Jam pindah ruangan wajib diisi'),
], [
  (req, res, next) => {
    if (req.body.jam_masuk) {
      const jam = req.body.jam_masuk.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_masuk = d;
    }
    if (req.body.jam_pindah_ruangan) {
      const jam = req.body.jam_pindah_ruangan.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_pindah_ruangan = d;
    }
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.jam_masuk) {
      const jam = req.body.jam_masuk.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_masuk = d;
    }
    if (req.body.jam_pindah_ruangan) {
      const jam = req.body.jam_pindah_ruangan.split(':');
      const d = new Date();
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_pindah_ruangan = d;
    }
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
