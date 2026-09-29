const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/authorize');
const ctrl = require('../controllers/settings.controller');

// Settings & Hospital Info GET / PUT
router.get('/', ctrl.getSettings);
router.put('/', verifyToken, checkRole('admin'), ctrl.upload.single('logo'), ctrl.updateSettings);

// INM Mappings GET / PUT
router.get('/inm-mappings', verifyToken, ctrl.getInmMappings);
router.put('/inm-mappings/:id', verifyToken, checkRole('admin', 'komite'), ctrl.updateInmMapping);

// Integration Logs & Dry Run
router.get('/integration-logs', verifyToken, checkRole('admin', 'komite'), ctrl.getIntegrationLogs);
router.post('/simulate-sync', verifyToken, checkRole('admin', 'komite'), ctrl.simulateDryRunSync);

module.exports = router;
