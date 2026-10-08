const backupService = require('../services/backup.service');

async function create(req, res, next) {
  try {
    const result = await backupService.createBackup();
    res.json({ success: true, message: 'Backup berhasil dibuat', data: result });
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const data = await backupService.listBackups();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function download(req, res, next) {
  try {
    const filepath = await backupService.resolveBackupPath(req.params.name);
    res.download(filepath);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const data = await backupService.deleteBackup(req.params.name);
    res.json({ success: true, message: 'Backup dihapus', data });
  } catch (err) { next(err); }
}

async function restore(req, res, next) {
  try {
    const data = await backupService.restoreBackup(req.params.name);
    res.json({ success: true, message: 'Database berhasil dipulihkan dari backup', data });
  } catch (err) { next(err); }
}

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File backup (.sql) wajib diunggah' });
    }
    if (!req.file.originalname.endsWith('.sql')) {
      return res.status(400).json({ success: false, message: 'Hanya file .sql yang diperbolehkan' });
    }
    const data = await backupService.saveUploadedBackup(req.file);
    res.json({ success: true, message: 'File backup berhasil diunggah', data });
  } catch (err) { next(err); }
}

async function uploadAndRestore(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File backup (.sql) wajib diunggah' });
    }
    if (!req.file.originalname.endsWith('.sql')) {
      return res.status(400).json({ success: false, message: 'Hanya file .sql yang diperbolehkan' });
    }
    const saved = await backupService.saveUploadedBackup(req.file);
    const restored = await backupService.restoreBackup(saved.filename);
    res.json({ 
      success: true, 
      message: 'File berhasil diunggah dan database berhasil dipulihkan', 
      data: { ...saved, restored } 
    });
  } catch (err) { next(err); }
}

module.exports = { create, list, download, remove, restore, upload, uploadAndRestore };
