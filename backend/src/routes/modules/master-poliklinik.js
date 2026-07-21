const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../../controllers/modules/master-poliklinik.controller');
const prisma = require('../../config/database');

async function checkPoliklinikAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (['admin', 'komite', 'pic_mutu'].includes(req.user.role)) {
    return next();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { unit: true }
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
  }

  // 1. Check if user belongs to Poliklinik unit
  if (user.unit) {
    const isPoli = user.unit.kode_unit === 'RJ_POLIKLINIK' || 
                   (user.unit.nama_unit && user.unit.nama_unit.toUpperCase().includes('POLI'));
    if (isPoli) {
      return next();
    }
  }

  // 2. Check if admin explicitly granted access via allowed_modules
  if (user.allowed_modules) {
    try {
      const allowed = typeof user.allowed_modules === 'string'
        ? JSON.parse(user.allowed_modules)
        : user.allowed_modules;
      if (Array.isArray(allowed) && (allowed.includes('#/master-poliklinik') || allowed.includes('/master-poliklinik'))) {
        return next();
      }
    } catch (e) { /* ignore parse error */ }
  }

  return res.status(403).json({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengelola master poliklinik.' });
}

router.use(verifyToken);

router.get('/', ctrl.getAll);

router.post('/', checkPoliklinikAccess, [
  body('nama').notEmpty().withMessage('Nama poliklinik wajib diisi').isLength({ max: 100 }).withMessage('Nama poliklinik maksimal 100 karakter'),
], validate, ctrl.create);

router.put('/:id', checkPoliklinikAccess, [
  body('nama').optional().notEmpty().withMessage('Nama poliklinik wajib diisi').isLength({ max: 100 }).withMessage('Nama poliklinik maksimal 100 karakter'),
], validate, ctrl.update);

router.delete('/:id', checkPoliklinikAccess, ctrl.remove);

module.exports = router;
