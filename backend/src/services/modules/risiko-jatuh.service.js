const prisma = require('../../config/database');

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.risikoJatuh.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.risikoJatuh.count({ where }),
  ]);
  return { data, total };
}

function sanitizeRisikoJatuh(data) {
  const fields = ['asesmen_awal', 'asesmen_ulang', 'intervensi', 'edukasi'];
  fields.forEach(f => {
    if (data[f] === 'tidak dilakukan') data[f] = 'tidak_dilakukan';
  });
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.usia !== undefined) data.usia = parseInt(data.usia);
  sanitizeRisikoJatuh(data);
  return prisma.risikoJatuh.create({ data });
}

async function update(id, body) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.usia !== undefined) data.usia = parseInt(data.usia);
  sanitizeRisikoJatuh(data);
  return prisma.risikoJatuh.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.risikoJatuh.delete({ where: { id } });
}

async function getSummary(where) {
  const data = await prisma.risikoJatuh.findMany({ where });
  const total = data.length;
  const patuh = data.filter(d =>
    d.asesmen_awal === 'dilakukan' && d.asesmen_ulang === 'dilakukan' &&
    d.intervensi === 'dilakukan' && d.edukasi === 'dilakukan'
  ).length;
  const persen = total > 0 ? ((patuh / total) * 100).toFixed(2) : 0;
  return { total, numerator: patuh, persen, standar: '100%' };
}

module.exports = { getAll, create, update, remove, getSummary };
