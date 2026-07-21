const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/kepatuhan-fornas.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('val1').isInt({ min: 0 }).withMessage('Total Resep (D) wajib berupa angka non-negatif'),
  body('val2').isInt({ min: 0 }).withMessage('Resep Sesuai Fornas (N) wajib berupa angka non-negatif')
], validate, ctrl.upsert);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.remove);

// Exceptions List
router.get('/obat-diluar-fornas', ctrl.getAllObatDiluarFornas);
router.post('/obat-diluar-fornas', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('nama_dokter').isString().notEmpty().withMessage('Nama dokter wajib diisi'),
  body('obat').custom(value => {
    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new Error('Obat tidak valid');
    }
    return true;
  })
], validate, ctrl.upsertObatDiluarFornas);
router.delete('/obat-diluar-fornas/:id', checkRole('admin', 'pic_mutu', 'petugas'), ctrl.removeObatDiluarFornas);

module.exports = router;
