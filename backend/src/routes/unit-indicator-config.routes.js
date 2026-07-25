const express = require('express');
const router = express.Router();
const controller = require('../controllers/unit-indicator-config.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/authorize');

router.use(verifyToken);

router.get('/indicators', controller.getAvailableIndicators);
router.get('/', controller.getUnitConfigs);
router.post('/', checkRole('admin', 'komite'), controller.saveUnitConfigs);

module.exports = router;
