const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/master-poliklinik.controller');

router.use(verifyToken);

router.get('/', ctrl.getAll);

router.post('/', checkRole('admin', 'pic_mutu', 'komite'), [
  body('nama').notEmpty().withMessage('Nama poliklinik wajib diisi').isLength({ max: 100 }).withMessage('Nama poliklinik maksimal 100 karakter'),
], validate, ctrl.create);

router.put('/:id', checkRole('admin', 'pic_mutu', 'komite'), [
  body('nama').optional().notEmpty().withMessage('Nama poliklinik wajib diisi').isLength({ max: 100 }).withMessage('Nama poliklinik maksimal 100 karakter'),
], validate, ctrl.update);

router.delete('/:id', checkRole('admin', 'pic_mutu', 'komite'), ctrl.remove);

module.exports = router;
