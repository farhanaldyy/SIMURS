const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/serah-terima-pasien.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('nama_pasien').notEmpty().withMessage('Nama pasien wajib diisi'),
  body('akun').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai akun tidak valid'),
  body('keluhan').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai keluhan tidak valid'),
  body('ttv').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai TTV tidak valid'),
  body('penunjang').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai penunjang tidak valid'),
  body('konsul').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai konsul tidak valid'),
  body('tindakan').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai tindakan tidak valid'),
  body('obat').isIn(['Sesuai', 'Tidak Sesuai']).withMessage('Nilai obat tidak valid'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

module.exports = router;
