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
  const skip = (page && limit) ? (page - 1) * limit : undefined;
  const take = limit ? limit : undefined;
  const [data, total] = await Promise.all([
    prisma.masterPoliklinik.findMany({ where, skip, take, orderBy: { nama: 'asc' } }),
    prisma.masterPoliklinik.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = {
    nama: body.nama,
    aktif: body.aktif !== undefined ? (body.aktif === true || body.aktif === 'true') : true
  };

  const record = await prisma.masterPoliklinik.create({ data });
  await logAudit(userId, 'master_poliklinik', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = {};
  if (body.nama !== undefined) data.nama = body.nama;
  if (body.aktif !== undefined) data.aktif = body.aktif === true || body.aktif === 'true';

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterPoliklinik.findUnique({ where: { id } });
  }

  const record = await prisma.masterPoliklinik.update({ where: { id }, data });
  await logAudit(userId, 'master_poliklinik', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterPoliklinik.findUnique({ where: { id } });
  }
  const record = await prisma.masterPoliklinik.delete({ where: { id } });
  await logAudit(userId, 'master_poliklinik', id, 'delete', oldRecord, null);
  return record;
}

module.exports = { getAll, create, update, remove };
