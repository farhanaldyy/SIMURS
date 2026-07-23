const service = require('../../services/modules/insiden-keselamatan.service');

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
  try { res.json({ success: true, data: await service.update(parseInt(req.params.id), req.body, req.user.id) }); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.remove(parseInt(req.params.id), req.user.id); res.json({ success: true, message: 'Data berhasil dihapus' }); } catch (err) { next(err); }
}

async function getSummary(req, res, next) {
  try {
    const where = {};
    if (req.query.periode_id) where.periode_id = parseInt(req.query.periode_id);
    if (req.query.unit_id) where.unit_id = parseInt(req.query.unit_id);
    res.json({ success: true, data: await service.getSummary(where) });
  } catch (err) { next(err); }
}

async function getSummaryData(req, res, next) {
  try {
    const { periode_id, unit_id } = req.query;
    if (!periode_id) return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
    const summary = await service.getSummaryData(periode_id, unit_id);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
}

async function upsertSummaryData(req, res, next) {
  try {
    const { periode_id, unit_id } = req.body;
    if (!periode_id) return res.status(400).json({ success: false, message: 'Periode ID wajib disertakan' });
    const summary = await service.upsertSummaryData(periode_id, unit_id, req.body);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, getSummary, getSummaryData, upsertSummaryData };
