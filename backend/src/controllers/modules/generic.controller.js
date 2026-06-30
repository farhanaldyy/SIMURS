function createGenericController(service) {
  return {
    async getAll(req, res, next) {
      try {
        const { periode_id, unit_id, page = 1, limit = 10, ...filters } = req.query;
        const where = {};
        if (periode_id) where.periode_id = parseInt(periode_id);
        if (unit_id) where.unit_id = parseInt(unit_id);
        
        // Map other queries directly if they exist
        for (const key in filters) {
          if (filters[key] !== undefined && filters[key] !== '') {
            if (key === 'jenis') {
              where.jenis = filters[key];
            } else if (key === 'lokasi') {
              where.lokasi = filters[key];
            }
          }
        }

        const result = await service.getAll(where, parseInt(page), parseInt(limit));
        res.json({
          success: true,
          data: result.data,
          meta: {
            total: result.total,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const data = await service.create(req.body, req.user.id);
        res.status(201).json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const data = await service.update(parseInt(req.params.id), req.body, req.user.id);
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        await service.remove(parseInt(req.params.id), req.user.id);
        res.json({ success: true, message: 'Data berhasil dihapus' });
      } catch (err) {
        next(err);
      }
    },

    async getSummary(req, res, next) {
      try {
        const { periode_id, unit_id, ...filters } = req.query;
        const where = {};
        if (periode_id) where.periode_id = parseInt(periode_id);
        if (unit_id) where.unit_id = parseInt(unit_id);

        for (const key in filters) {
          if (filters[key] !== undefined && filters[key] !== '') {
            if (key === 'jenis') {
              where.jenis = filters[key];
            } else if (key === 'lokasi') {
              where.lokasi = filters[key];
            }
          }
        }

        const summary = await service.getSummary(where);
        res.json({ success: true, data: summary });
      } catch (err) {
        next(err);
      }
    }
  };
}

module.exports = { createGenericController };
