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
  const record = await prisma.insidenKeselamatan.create({ data });
  await logAudit(userId, 'insidenKeselamatan', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.tanggal_kejadian && typeof data.tanggal_kejadian === 'string') {
    data.tanggal_kejadian = new Date(data.tanggal_kejadian);
  }
  if (data.jam_kejadian && typeof data.jam_kejadian === 'string') {
    data.jam_kejadian = new Date(`1970-01-01T${data.jam_kejadian}:00Z`);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.insidenKeselamatan.findUnique({ where: { id } });
  }

  const record = await prisma.insidenKeselamatan.update({ where: { id }, data });
  await logAudit(userId, 'insidenKeselamatan', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.insidenKeselamatan.findUnique({ where: { id } });
  }
  const record = await prisma.insidenKeselamatan.delete({ where: { id } });
  await logAudit(userId, 'insidenKeselamatan', id, 'delete', oldRecord, null);
  return record;
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
