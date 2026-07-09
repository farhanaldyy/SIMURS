const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/mutu-rekam-medis.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  
  body('kelengkapan_ranap_num').isInt({ min: 0 }).withMessage('Numerator kelengkapan ranap wajib berupa angka non-negatif'),
  body('kelengkapan_ranap_den').isInt({ min: 0 }).withMessage('Denominator kelengkapan ranap wajib berupa angka non-negatif'),
  
  body('pengembalian_num').isInt({ min: 0 }).withMessage('Numerator pengembalian RM wajib berupa angka non-negatif'),
  body('pengembalian_den').isInt({ min: 0 }).withMessage('Denominator pengembalian RM wajib berupa angka non-negatif'),
  
  body('antrian_online_num').isInt({ min: 0 }).withMessage('Numerator antrian online wajib berupa angka non-negatif'),
  body('antrian_online_den').isInt({ min: 0 }).withMessage('Denominator antrian online wajib berupa angka non-negatif'),
  
  body('coding_num').isInt({ min: 0 }).withMessage('Numerator ketepatan coding wajib berupa angka non-negatif'),
  body('coding_den').isInt({ min: 0 }).withMessage('Denominator ketepatan coding wajib berupa angka non-negatif'),
  
  body('mobile_jkn_num').isInt({ min: 0 }).withMessage('Numerator antrian mobile JKN wajib berupa angka non-negatif'),
  body('mobile_jkn_den').isInt({ min: 0 }).withMessage('Denominator antrian mobile JKN wajib berupa angka non-negatif')
], validate, ctrl.upsert);

router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
