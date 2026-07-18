const service = require('../../services/modules/kesalahan-penyerahan-obat.service');

module.exports = {
  async getAll(req, res, next) {
    try {
      const { periode_id } = req.query;
      const where = {};
      if (periode_id) where.periode_id = parseInt(periode_id);

      const result = await service.getAll(where);
      res.json({
        success: true,
        data: result.data,
        meta: { total: result.total }
      });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req, res, next) {
    try {
      const data = await service.upsert(req.body, req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await service.delete(parseInt(req.params.id), req.user.id);
      res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req, res, next) {
    try {
      const { periode_id } = req.query;
      const summary = await service.getSummary(periode_id);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
};
