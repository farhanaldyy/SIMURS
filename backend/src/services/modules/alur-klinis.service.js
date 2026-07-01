const prisma = require('../../config/database');

async function logAudit(userId, tabel, recordId, aksi, dataLama = null, dataBaru = null) {
  if (!userId) return;
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        tabel,
        record_id: recordId,
        aksi,
        data_lama: dataLama ? JSON.parse(JSON.stringify(dataLama)) : null,
        data_baru: dataBaru ? JSON.parse(JSON.stringify(dataBaru)) : null,
      }
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}


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
  const record = await prisma.alurKlinis.create({ data });
  await logAudit(userId, 'alurKlinis', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.los === 'tidak sesuai') data.los = 'tidak_sesuai';
  if (data.penunjang === 'tidak sesuai') data.penunjang = 'tidak_sesuai';
  if (data.obat === 'tidak sesuai') data.obat = 'tidak_sesuai';

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.alurKlinis.findUnique({ where: { id } });
  }

  const record = await prisma.alurKlinis.update({ where: { id }, data });
  await logAudit(userId, 'alurKlinis', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.alurKlinis.findUnique({ where: { id } });
  }
  const record = await prisma.alurKlinis.delete({ where: { id } });
  await logAudit(userId, 'alurKlinis', id, 'delete', oldRecord, null);
  return record;
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
