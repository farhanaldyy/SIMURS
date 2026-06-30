const router = require('express').Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/laporan.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);

router.get('/export/excel', ctrl.exportExcel);
router.post('/import-excel', upload.single('file'), ctrl.importExcel);

module.exports = router;
