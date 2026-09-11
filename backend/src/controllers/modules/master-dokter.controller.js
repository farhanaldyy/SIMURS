const service = require('../../services/modules/master-dokter.service');

async function getAll(req, res, next) {
  try {
    const all = req.query.all === 'true';
    const page = all ? null : (parseInt(req.query.page) || 1);
    const limit = all ? null : (parseInt(req.query.limit) || 10);
    const search = req.query.search || '';

    const where = {};
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { spesialisasi: { contains: search } }
      ];
    }
    if (req.query.aktif !== undefined) {
      where.aktif = req.query.aktif === 'true';
    }

    const result = await service.getAll(where, page, limit);
    res.json({
      success: true,
      data: result.data,
      meta: {
        page: all ? 1 : page,
        limit: all ? result.total : limit,
        total: result.total,
        totalPages: all ? 1 : Math.ceil(result.total / (limit || 1)),
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
      message: 'Master Dokter berhasil ditambahkan',
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
      message: 'Master Dokter berhasil diubah',
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
      message: 'Master Dokter berhasil dihapus'
    });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Master Dokter tidak dapat dihapus karena datanya masih terelasi di sistem.'
      });
    }
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
