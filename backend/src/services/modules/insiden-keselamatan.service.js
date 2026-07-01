const prisma = require('../../config/database');

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.insidenKeselamatan.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.insidenKeselamatan.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.tanggal_kejadian && typeof data.tanggal_kejadian === 'string') {
    data.tanggal_kejadian = new Date(data.tanggal_kejadian);
  }
  if (data.jam_kejadian && typeof data.jam_kejadian === 'string') {
    data.jam_kejadian = new Date(`1970-01-01T${data.jam_kejadian}:00Z`);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  return prisma.insidenKeselamatan.create({ data });
}

async function update(id, body) {
  const data = { ...body };
  if (data.tanggal_kejadian && typeof data.tanggal_kejadian === 'string') {
    data.tanggal_kejadian = new Date(data.tanggal_kejadian);
  }
  if (data.jam_kejadian && typeof data.jam_kejadian === 'string') {
    data.jam_kejadian = new Date(`1970-01-01T${data.jam_kejadian}:00Z`);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  return prisma.insidenKeselamatan.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.insidenKeselamatan.delete({ where: { id } });
}

async function getSummary(where) {
  const data = await prisma.insidenKeselamatan.findMany({ where });
  const total = data.length;
  const byJenis = {};
  data.forEach(d => { byJenis[d.jenis_insiden] = (byJenis[d.jenis_insiden] || 0) + 1; });
  const persen = total === 0 ? 100 : 0;
  return { total, byJenis, persen, standar: '0%' };
}

module.exports = { getAll, create, update, remove, getSummary };
