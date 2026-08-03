const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/insiden-pasien-jatuh-hd.service');

const baseCtrl = createGenericController(service);

module.exports = {
  ...baseCtrl,
  getSummaryData: async (req, res, next) => {
    try {
      const { periode_id } = req.query;
      const data = await service.getSummaryData(periode_id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  upsertSummaryData: async (req, res, next) => {
    try {
      const { periode_id } = req.body;
      const data = await service.upsertSummaryData(periode_id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
