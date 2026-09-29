const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/simar.controller');

router.get('/export-inm', verifyToken, ctrl.exportInmReport);
router.get('/export-excel', verifyToken, ctrl.exportInmExcel);

module.exports = router;
