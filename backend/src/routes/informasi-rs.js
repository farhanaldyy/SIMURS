const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/authorize');
const ctrl = require('../controllers/informasi-rs.controller');

// GET endpoint (accessible for app branding & headers)
router.get('/', ctrl.getInformasiRS);

// PUT endpoint (admin / komite only) with optional single file upload field 'logo'
router.put('/', verifyToken, checkRole('admin', 'komite'), ctrl.upload.single('logo'), ctrl.updateInformasiRS);

module.exports = router;
