const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../../controllers/rekap-mutu.controller');

router.use(verifyToken);

router.get('/', ctrl.getRekapData);
router.get('/excel', ctrl.exportExcel);

module.exports = router;
