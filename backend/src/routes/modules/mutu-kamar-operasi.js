const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/mutu-kamar-operasi.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('tipe').isIn(['kematian_meja_operasi', 'salah_sisi', 'salah_orang', 'salah_prosedur']).withMessage('Tipe indikator tidak valid'),
  body('total_kejadian').isInt({ min: 0 }).withMessage('Total kejadian wajib berupa angka non-negatif'),
  body('total_operasi').isInt({ min: 0 }).withMessage('Total operasi wajib berupa angka non-negatif')
], validate, ctrl.upsert);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
