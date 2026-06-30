const prisma = require('../../config/database');

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.alurKlinis.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.alurKlinis.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.los === 'tidak sesuai') data.los = 'tidak_sesuai';
  if (data.penunjang === 'tidak sesuai') data.penunjang = 'tidak_sesuai';
  if (data.obat === 'tidak sesuai') data.obat = 'tidak_sesuai';
  return prisma.alurKlinis.create({ data });
}

async function update(id, body) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.los === 'tidak sesuai') data.los = 'tidak_sesuai';
  if (data.penunjang === 'tidak sesuai') data.penunjang = 'tidak_sesuai';
  if (data.obat === 'tidak sesuai') data.obat = 'tidak_sesuai';
  return prisma.alurKlinis.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.alurKlinis.delete({ where: { id } });
}

async function getSummary(where) {
  const data = await prisma.alurKlinis.findMany({ where });
  const total = data.length;
  const patuh = data.filter(d =>
    d.los === 'sesuai' && d.penunjang === 'sesuai' && d.obat === 'sesuai'
  ).length;
  const persen = total > 0 ? ((patuh / total) * 100).toFixed(2) : 0;
  return { total, numerator: patuh, persen, standar: '100%' };
}

module.exports = { getAll, create, update, remove, getSummary };
