const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/authorize');
const ctrl = require('../../controllers/modules/simrs-response-time-it.controller');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);
router.get('/template-excel', ctrl.downloadTemplate);
router.post('/import-excel', upload.single('file'), ctrl.importExcel);

router.post('/', [
  body('periode_id').isInt().withMessage('Periode wajib dipilih'),
  body('unit_id').isInt().withMessage('Unit wajib dipilih'),
  body('unit_diperbaiki').notEmpty().withMessage('Unit yang diperbaiki wajib diisi'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('permasalahan').notEmpty().withMessage('Permasalahan wajib diisi'),
  body('jam_laporan').notEmpty().withMessage('Jam laporan wajib diisi'),
  body('jam_tindakan').notEmpty().withMessage('Jam tindakan wajib diisi'),
  body('status').isIn(['Selesai', 'Belum Selesai', 'Lainnya']).withMessage('Status tidak valid'),
  body('petugas').isIn(['Muhamad Sarip', 'Panji Prasetyo', 'Farhan Aldiansyah']).withMessage('Nama petugas tidak valid'),
], validate, ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', checkRole('admin', 'pic_mutu'), ctrl.remove);

module.exports = router;
