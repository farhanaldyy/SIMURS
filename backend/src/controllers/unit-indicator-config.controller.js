const service = require('../services/unit-indicator-config.service');

async function getAvailableIndicators(req, res, next) {
  try {
    const data = await service.getAllAvailableIndicators();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getUnitConfigs(req, res, next) {
  try {
    const { unitId } = req.query;
    if (!unitId) {
      return res.status(400).json({ success: false, message: 'Parameter unitId wajib diisi' });
    }
    const data = await service.getConfigsByUnit(unitId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveUnitConfigs(req, res, next) {
  try {
    const { unitId, activeIndicatorIds } = req.body;
    if (!unitId) {
      return res.status(400).json({ success: false, message: 'Parameter unitId wajib diisi' });
    }
    const data = await service.saveUnitConfigs(unitId, activeIndicatorIds || []);
    res.json({ success: true, message: 'Konfigurasi indikator unit berhasil disimpan', data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableIndicators,
  getUnitConfigs,
  saveUnitConfigs
};
