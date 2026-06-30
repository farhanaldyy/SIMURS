const prisma = require('../../config/database');

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.identifikasiPasien.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.identifikasiPasien.count({ where }),
  ]);
  return { data, total };
}

function sanitizeIdentifikasi(data) {
  const fields = ['pemberian_obat', 'nutrisi_ngt', 'pemberian_darah', 'tindakan_keperawatan'];
  fields.forEach(f => {
    if (data[f] === 'tidak dilakukan') data[f] = 'tidak_dilakukan';
    if (data[f] === 'tidak ada peluang') data[f] = 'tidak_ada_peluang';
  });
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.tanggal && typeof data.tanggal === 'string') {
    data.tanggal = new Date(data.tanggal);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  sanitizeIdentifikasi(data);
  return prisma.identifikasiPasien.create({ data });
}

async function update(id, body) {
  const data = { ...body };
  if (data.tanggal && typeof data.tanggal === 'string') {
    data.tanggal = new Date(data.tanggal);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  sanitizeIdentifikasi(data);
  return prisma.identifikasiPasien.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.identifikasiPasien.delete({ where: { id } });
}

async function getSummary(where) {
  const data = await prisma.identifikasiPasien.findMany({ where });
  const fields = ['pemberian_obat', 'nutrisi_ngt', 'pemberian_darah', 'tindakan_keperawatan'];
  let numerator = 0;
  let denominator = 0;
  data.forEach(d => {
    fields.forEach(f => {
      if (d[f] !== 'tidak ada peluang' && d[f] !== 'tidak_ada_peluang') {
        denominator++;
        if (d[f] === 'dilakukan') numerator++;
      }
    });
  });
  const persen = denominator > 0 ? ((numerator / denominator) * 100).toFixed(2) : 0;
  return { total: data.length, numerator, denominator, persen, standar: '100%' };
}

module.exports = { getAll, create, update, remove, getSummary };
