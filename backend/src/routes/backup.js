const router = require('express').Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/authorize');
const ctrl = require('../controllers/backup.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);
router.use(checkRole('admin'));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.post('/restore/:name', ctrl.restore);
router.post('/upload', upload.single('file'), ctrl.upload);
router.post('/upload-restore', upload.single('file'), ctrl.uploadAndRestore);
router.get('/:name/download', ctrl.download);
router.delete('/:name', ctrl.remove);

module.exports = router;
