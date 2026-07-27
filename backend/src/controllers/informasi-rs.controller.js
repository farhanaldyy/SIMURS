const path = require('path');
const fs = require('fs');
const multer = require('multer');
const service = require('../services/informasi-rs.service');

// Configure upload directory
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (jpg, png, svg, webp) yang diperbolehkan!'));
  }
});

async function getInformasiRS(req, res, next) {
  try {
    const data = await service.getInformasiRS();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateInformasiRS(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.logo_url = `/uploads/${req.file.filename}`;
    }
    const data = await service.updateInformasiRS(body);
    res.json({ success: true, message: 'Informasi Rumah Sakit berhasil diperbarui', data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  getInformasiRS,
  updateInformasiRS
};
