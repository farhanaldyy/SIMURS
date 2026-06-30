const service = require('../../services/modules/waktu-tanggap-sc.service');

async function getAll(req, res, next) {
  try {
    const { periode_id, unit_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (periode_id) where.periode_id = parseInt(periode_id);
    if (unit_id) where.unit_id = parseInt(unit_id);
    const result = await service.getAll(where, parseInt(page), parseInt(limit));
    res.json({ success: true, data: result.data, meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.create(req.body, req.user.id) }); } catch (err) { next(err); }
}

async function update(req, res, next) {
  try { res.json({ success: true, data: await service.update(parseInt(req.params.id), req.body) }); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.remove(parseInt(req.params.id)); res.json({ success: true, message: 'Data berhasil dihapus' }); } catch (err) { next(err); }
}

async function getSummary(req, res, next) {
  try {
    const where = {};
    if (req.query.periode_id) where.periode_id = parseInt(req.query.periode_id);
    if (req.query.unit_id) where.unit_id = parseInt(req.query.unit_id);
    res.json({ success: true, data: await service.getSummary(where) });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, getSummary };
