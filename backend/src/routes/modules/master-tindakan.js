const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../../controllers/modules/master-tindakan.controller');
const prisma = require('../../config/database');

async function checkTindakanAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (['admin', 'komite', 'pic_mutu'].includes(req.user.role)) {
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
  }

  if (user.allowed_modules) {
    try {
      const allowed = typeof user.allowed_modules === 'string'
        ? JSON.parse(user.allowed_modules)
        : user.allowed_modules;
      if (Array.isArray(allowed) && (allowed.includes('#/master-tindakan') || allowed.includes('/master-tindakan'))) {
        return next();
      }
    } catch (e) { /* ignore parse error */ }
  }

  return res.status(403).json({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengelola master tindakan.' });
}

router.use(verifyToken);

router.get('/', ctrl.getAll);

router.post('/', checkTindakanAccess, [
  body('nama').notEmpty().withMessage('Nama tindakan wajib diisi').isLength({ max: 100 }).withMessage('Nama tindakan maksimal 100 karakter'),
  body('nilai').isNumeric().withMessage('Nilai wajib berupa angka'),
], validate, ctrl.create);

router.put('/:id', checkTindakanAccess, [
  body('nama').optional().notEmpty().withMessage('Nama tindakan wajib diisi').isLength({ max: 100 }).withMessage('Nama tindakan maksimal 100 karakter'),
  body('nilai').optional().isNumeric().withMessage('Nilai wajib berupa angka'),
], validate, ctrl.update);

router.delete('/:id', checkTindakanAccess, ctrl.remove);

module.exports = router;
