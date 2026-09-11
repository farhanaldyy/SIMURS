const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../../controllers/modules/master-dokter.controller');
const prisma = require('../../config/database');

async function checkDokterAccess(req, res, next) {
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
      if (Array.isArray(allowed) && (allowed.includes('#/master-dokter') || allowed.includes('/master-dokter'))) {
        return next();
      }
    } catch (e) { /* ignore parse error */ }
  }

  return res.status(403).json({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengelola master dokter.' });
}

router.use(verifyToken);

router.get('/', ctrl.getAll);

router.post('/', checkDokterAccess, [
  body('nama').notEmpty().withMessage('Nama dokter wajib diisi').isLength({ max: 100 }).withMessage('Nama dokter maksimal 100 karakter'),
  body('spesialisasi').optional().isLength({ max: 100 }).withMessage('Spesialisasi maksimal 100 karakter'),
], validate, ctrl.create);

router.put('/:id', checkDokterAccess, [
  body('nama').optional().notEmpty().withMessage('Nama dokter wajib diisi').isLength({ max: 100 }).withMessage('Nama dokter maksimal 100 karakter'),
  body('spesialisasi').optional().isLength({ max: 100 }).withMessage('Spesialisasi maksimal 100 karakter'),
], validate, ctrl.update);

router.delete('/:id', checkDokterAccess, ctrl.remove);

module.exports = router;
