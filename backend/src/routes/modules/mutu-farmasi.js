const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/mutu-farmasi.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tipe').isIn(['double_check', 'tidak_tersedia_rajal', 'tidak_tersedia_ranap', 'waktu_tunggu', 'rata_waktu_tunggu']).withMessage('Tipe indikator tidak valid'),
  body('val1').isInt({ min: 0 }).withMessage('Val 1 wajib berupa angka non-negatif'),
  body('val2').isInt({ min: 0 }).withMessage('Val 2 wajib berupa angka non-negatif'),
  body('val3').optional().isInt({ min: 0 }).withMessage('Val 3 wajib berupa angka non-negatif'),
  body('val4').optional().isInt({ min: 0 }).withMessage('Val 4 wajib berupa angka non-negatif')
], validate, ctrl.upsert);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
