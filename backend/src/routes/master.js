const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/authorize');
const mc = require('../controllers/master.controller');

router.use(verifyToken);

// Units
router.get('/units', mc.getUnits);

// Periode
router.get('/periode', mc.getPeriode);
router.post('/periode', checkRole('admin'), [
  body('bulan').isInt({ min: 1, max: 12 }).withMessage('Bulan harus 1-12'),
  body('tahun').isInt({ min: 2020, max: 2100 }).withMessage('Tahun tidak valid'),
], validate, mc.createPeriode);
router.patch('/periode/:id/close', checkRole('admin'), mc.closePeriode);

// Users
router.get('/users', checkRole('admin'), mc.getUsers);
router.post('/users', checkRole('admin'), [
  body('nama').notEmpty().withMessage('Nama wajib diisi'),
  body('username').notEmpty().withMessage('Username wajib diisi'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role').isIn(['admin', 'pic_mutu', 'komite', 'petugas']).withMessage('Role tidak valid'),
], validate, mc.createUser);
router.put('/users/:id', checkRole('admin'), mc.updateUser);
router.delete('/users/:id', checkRole('admin'), mc.deleteUser);
router.get('/audit-log', checkRole('admin'), mc.getAuditLogs);

module.exports = router;
