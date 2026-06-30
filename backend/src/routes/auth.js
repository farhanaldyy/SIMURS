const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/login', [
  body('username').notEmpty().withMessage('Username wajib diisi'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
], validate, authController.login);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
