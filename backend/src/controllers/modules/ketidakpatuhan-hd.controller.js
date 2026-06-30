const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/ketidakpatuhan-hd.service');

const baseCtrl = createGenericController(service);

const ctrl = {
  ...baseCtrl,
  async getSummaryData(req, res, next) {
    try {
      const { periode_id } = req.query;
      if (!periode_id) return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
      const summary = await service.getSummaryData(periode_id);
      res.json({ success: true, data: summary });
    } catch (err) { next(err); }
  },

  async upsertSummaryData(req, res, next) {
    try {
      const { periode_id } = req.body;
      if (!periode_id) return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
      const summary = await service.upsertSummaryData(periode_id, req.body);
      res.json({ success: true, data: summary });
    } catch (err) { next(err); }
  }
};

module.exports = ctrl;
