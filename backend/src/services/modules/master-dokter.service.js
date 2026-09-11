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

async function getAll(where = {}, page, limit) {
  const skip = (page && limit) ? (page - 1) * limit : undefined;
  const take = limit ? limit : undefined;
  const [data, total] = await Promise.all([
    prisma.masterDokter.findMany({ where, skip, take, orderBy: { nama: 'asc' } }),
    prisma.masterDokter.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = {
    nama: body.nama.trim(),
    spesialisasi: body.spesialisasi ? body.spesialisasi.trim() : null,
    aktif: body.aktif !== undefined ? (body.aktif === true || body.aktif === 'true') : true
  };

  const record = await prisma.masterDokter.create({ data });
  await logAudit(userId, 'master_dokter', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = {};
  if (body.nama !== undefined) data.nama = body.nama.trim();
  if (body.spesialisasi !== undefined) data.spesialisasi = body.spesialisasi ? body.spesialisasi.trim() : null;
  if (body.aktif !== undefined) data.aktif = body.aktif === true || body.aktif === 'true';

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterDokter.findUnique({ where: { id } });
  }

  const record = await prisma.masterDokter.update({ where: { id }, data });
  await logAudit(userId, 'master_dokter', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterDokter.findUnique({ where: { id } });
  }
  const record = await prisma.masterDokter.delete({ where: { id } });
  await logAudit(userId, 'master_dokter', id, 'delete', oldRecord, null);
  return record;
}

module.exports = { getAll, create, update, remove };
