const path = require('path');
const fs = require('fs');
const multer = require('multer');
const settingsService = require('../services/settings.service');
const auditLogService = require('../services/audit-log.service');

// Configure logo upload directory
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
  },
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
  },
});

async function getSettings(req, res, next) {
  try {
    const data = await settingsService.getSettings();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.logo_url = `/uploads/${req.file.filename}`;
    }
    const data = await settingsService.updateSettings(body);
    
    // Audit Log
    if (req.user) {
      await auditLogService.createAuditLog({
        user_id: req.user.id,
        aksi: 'update',
        tabel_target: 'informasi_rumah_sakit',
        record_id: data.id,
        data_baru: { keterangan: `Memperbarui konfigurasi aplikasi & mode integrasi (${data.integration_mode})` },
      });
    }

    res.json({ success: true, message: 'Konfigurasi Pengaturan & Informasi RS berhasil diperbarui', data });
  } catch (error) {
    next(error);
  }
}

async function getInmMappings(req, res, next) {
  try {
    const data = await settingsService.getInmMappings();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateInmMapping(req, res, next) {
  try {
    const { id } = req.params;
    const data = await settingsService.updateInmMapping(id, req.body);
    
    // Audit Log
    if (req.user) {
      await auditLogService.createAuditLog({
        user_id: req.user.id,
        aksi: 'update',
        tabel_target: 'inm_indicator_mappings',
        record_id: data.id,
        data_baru: { keterangan: `Memperbarui pemetaan kode INM (${data.kode_inm_kemenkes || '-'}) untuk ${data.nama_indikator_internal}` },
      });
    }

    res.json({ success: true, message: 'Pemetaan Kode INM berhasil diperbarui', data });
  } catch (error) {
    next(error);
  }
}

async function getIntegrationLogs(req, res, next) {
  try {
    const data = await settingsService.getIntegrationLogs(100);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function simulateDryRunSync(req, res, next) {
  try {
    const { target_system = 'SIMAR' } = req.body;
    const settings = await settingsService.getSettings();
    const mappings = await settingsService.getInmMappings();

    const activeMappings = mappings.filter((m) => m.aktif && m.kode_inm_kemenkes);

    const hasInmKey = Boolean(settings.inm_api_key);
    const hasSimarKey = Boolean(settings.simar_api_key);

    const resultPayload = {
      timestamp: new Date().toISOString(),
      mode: settings.integration_mode,
      kode_fasyankes: settings.kode_fasyankes || settings.kode_rs,
      target_system,
      inm_endpoint: settings.inm_api_url || '(belum dikonfigurasi)',
      inm_api_key_status: hasInmKey ? '✅ Sudah dikonfigurasi' : '⚠️ Belum dikonfigurasi',
      simar_endpoint: settings.simar_api_url || '(belum dikonfigurasi)',
      simar_api_key_status: hasSimarKey ? '✅ Sudah dikonfigurasi' : '⚠️ Belum dikonfigurasi',
      mapped_indicators_count: activeMappings.length,
      sample_payload: activeMappings.slice(0, 5).map((m) => ({
        kode_inm: m.kode_inm_kemenkes,
        nama_indikator: m.nama_inm_kemenkes || m.nama_indikator_internal,
        target: m.target_inm,
        satuan: m.satuan,
      })),
    };

    let isSuccess = settings.integration_mode !== 'disabled';
    let errorMessage = null;

    if (settings.integration_mode === 'disabled') {
      isSuccess = false;
      errorMessage = 'Mode integrasi disetel ke Disabled. Silakan ubah ke Sandbox atau Production.';
    } else if (target_system === 'INM' && !hasInmKey) {
      isSuccess = false;
      errorMessage = 'API Key INM Kemenkes belum dikonfigurasi di pengaturan.';
    }

    const status = isSuccess ? 'SUCCESS' : 'FAILED';

    await settingsService.createIntegrationLog({
      target_system,
      action: 'DRY_RUN',
      status,
      payload: resultPayload,
      response: isSuccess ? { message: 'Simulasi pengiriman data berhasil (Dry-Run Check Clean)' } : null,
      error_message: errorMessage,
      created_by: req.user ? req.user.id : null,
    });

    res.json({
      success: isSuccess,
      message: isSuccess ? 'Simulasi Dry-Run Sinkronisasi Berhasil' : errorMessage,
      data: resultPayload,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  getSettings,
  updateSettings,
  getInmMappings,
  updateInmMapping,
  getIntegrationLogs,
  simulateDryRunSync,
};
