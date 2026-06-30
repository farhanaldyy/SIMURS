const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/angka-kematian-ranap.controller');

router.use(verifyToken);

router.get('/', (req, res, next) => { req.query.lokasi = 'ranap'; next(); }, ctrl.getAll);
router.get('/summary', (req, res, next) => { req.query.lokasi = 'ranap'; next(); }, ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('no_rm').notEmpty().withMessage('No RM wajib diisi'),
  body('tanggal_masuk').isISO8601().withMessage('Tanggal masuk tidak valid'),
  body('tanggal_keluar').isISO8601().withMessage('Tanggal keluar tidak valid'),
  body('jam_masuk').notEmpty().withMessage('Jam masuk wajib diisi'),
  body('jam_keluar').notEmpty().withMessage('Jam keluar wajib diisi'),
], [
  (req, res, next) => {
    // Map dates
    if (req.body.tanggal_masuk) req.body.tanggal_masuk = new Date(req.body.tanggal_masuk);
    if (req.body.tanggal_keluar) req.body.tanggal_keluar = new Date(req.body.tanggal_keluar);
    // Combine date and time for Prisma DateTime field
    if (req.body.jam_masuk && req.body.tanggal_masuk) {
      const jam = req.body.jam_masuk.split(':');
      const d = new Date(req.body.tanggal_masuk);
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_masuk = d;
    }
    if (req.body.jam_keluar && req.body.tanggal_keluar) {
      const jam = req.body.jam_keluar.split(':');
      const d = new Date(req.body.tanggal_keluar);
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_keluar = d;
    }
    next();
  }
], validate, ctrl.create);

router.put('/:id', [
  (req, res, next) => {
    if (req.body.tanggal_masuk) req.body.tanggal_masuk = new Date(req.body.tanggal_masuk);
    if (req.body.tanggal_keluar) req.body.tanggal_keluar = new Date(req.body.tanggal_keluar);
    if (req.body.jam_masuk && req.body.tanggal_masuk) {
      const jam = req.body.jam_masuk.split(':');
      const d = new Date(req.body.tanggal_masuk);
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_masuk = d;
    }
    if (req.body.jam_keluar && req.body.tanggal_keluar) {
      const jam = req.body.jam_keluar.split(':');
      const d = new Date(req.body.tanggal_keluar);
      d.setHours(parseInt(jam[0]), parseInt(jam[1]), 0, 0);
      req.body.jam_keluar = d;
    }
    next();
  }
], ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
