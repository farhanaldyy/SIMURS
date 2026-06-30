const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// === UNITS ===
async function getUnits(req, res, next) {
  try {
    const units = await prisma.unit.findMany({ where: { aktif: true }, orderBy: { nama_unit: 'asc' } });
    res.json({ success: true, data: units });
  } catch (err) { next(err); }
}

// === PERIODE ===
async function getPeriode(req, res, next) {
  try {
    const periode = await prisma.periode.findMany({ orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }] });
    res.json({ success: true, data: periode });
  } catch (err) { next(err); }
}

async function createPeriode(req, res, next) {
  try {
    const { bulan, tahun } = req.body;
    const periode = await prisma.periode.create({ data: { bulan: parseInt(bulan), tahun: parseInt(tahun) } });
    res.status(201).json({ success: true, data: periode });
  } catch (err) { next(err); }
}

async function closePeriode(req, res, next) {
  try {
    const periode = await prisma.periode.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'closed' },
    });
    res.json({ success: true, data: periode });
  } catch (err) { next(err); }
}

// === USERS ===
async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: { unit: true },
      omit: { password_hash: true },
      orderBy: { nama: 'asc' },
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try {
    const { nama, username, password, role, unit_id, allowed_modules } = req.body;
    const allowedModulesStr = Array.isArray(allowed_modules) ? JSON.stringify(allowed_modules) : allowed_modules;
    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { nama, username, password_hash, role, unit_id: unit_id ? parseInt(unit_id) : null, allowed_modules: allowedModulesStr },
      omit: { password_hash: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const { nama, role, unit_id, aktif, password, allowed_modules } = req.body;
    const allowedModulesStr = Array.isArray(allowed_modules) ? JSON.stringify(allowed_modules) : allowed_modules;
    const data = { nama, role, unit_id: unit_id ? parseInt(unit_id) : null, aktif, allowed_modules: allowedModulesStr };
    if (password) data.password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      omit: { password_hash: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, tabel } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (tabel) where.tabel = tabel;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const users = await prisma.user.findMany({ select: { id: true, nama: true } });
    const userMap = new Map(users.map(u => [u.id, u.nama]));

    const mapped = logs.map(l => ({
      ...l,
      user_nama: userMap.get(l.user_id) || `User ID ${l.user_id}`
    }));

    res.json({
      success: true,
      data: mapped,
      meta: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) { next(err); }
}

module.exports = { getUnits, getPeriode, createPeriode, closePeriode, getUsers, createUser, updateUser, getAuditLogs, deleteUser };
