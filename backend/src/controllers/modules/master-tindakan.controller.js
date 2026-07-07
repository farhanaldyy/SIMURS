const service = require('../../services/modules/master-tindakan.service');

async function getAll(req, res, next) {
  try {
    const all = req.query.all === 'true';
    const page = all ? null : (parseInt(req.query.page) || 1);
    const limit = all ? null : (parseInt(req.query.limit) || 10);
    const search = req.query.search || '';

    const where = {};
    if (search) {
      where.nama = { contains: search };
    }

    const result = await service.getAll(where, page, limit);
    res.json({
      success: true,
      data: result.data,
      meta: {
        page: all ? 1 : page,
        limit: all ? result.total : limit,
        total: result.total,
        totalPages: all ? 1 : Math.ceil(result.total / limit),
      }
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await service.create(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Master Tindakan berhasil ditambahkan',
      data: record
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const record = await service.update(id, req.body, req.user.id);
    res.json({
      success: true,
      message: 'Master Tindakan berhasil diubah',
      data: record
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await service.remove(id, req.user.id);
    res.json({
      success: true,
      message: 'Master Tindakan berhasil dihapus'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
