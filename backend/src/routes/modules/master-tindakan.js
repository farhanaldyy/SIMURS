const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/master-tindakan.controller');

router.use(verifyToken);
router.use(checkRole('admin', 'pic_mutu', 'komite'));

router.get('/', ctrl.getAll);

router.post('/', [
  body('nama').notEmpty().withMessage('Nama tindakan wajib diisi').isLength({ max: 100 }).withMessage('Nama tindakan maksimal 100 karakter'),
  body('nilai').isNumeric().withMessage('Nilai wajib berupa angka'),
], validate, ctrl.create);

router.put('/:id', [
  body('nama').optional().notEmpty().withMessage('Nama tindakan wajib diisi').isLength({ max: 100 }).withMessage('Nama tindakan maksimal 100 karakter'),
  body('nilai').optional().isNumeric().withMessage('Nilai wajib berupa angka'),
], validate, ctrl.update);

router.delete('/:id', ctrl.remove);

module.exports = router;
