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
    prisma.masterTindakan.findMany({ where, skip, take, orderBy: { nama: 'asc' } }),
    prisma.masterTindakan.count({ where }),
  ]);
  return { data, total };
}

const apdKeys = [
  'apd_penutup_kepala',
  'apd_face_shield',
  'apd_masker',
  'apd_apron',
  'apd_coverall',
  'apd_sarung_tangan',
  'apd_cover_shoes'
];

async function create(body, userId) {
  const data = {
    nama: body.nama,
    nilai: parseFloat(body.nilai) || 0
  };
  apdKeys.forEach(k => {
    if (body[k] !== undefined) {
      data[k] = body[k] === true || body[k] === 'true';
    }
  });

  const record = await prisma.masterTindakan.create({ data });
  await logAudit(userId, 'master_tindakan', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = {};
  if (body.nama !== undefined) data.nama = body.nama;
  if (body.nilai !== undefined) data.nilai = parseFloat(body.nilai) || 0;
  apdKeys.forEach(k => {
    if (body[k] !== undefined) {
      data[k] = body[k] === true || body[k] === 'true';
    }
  });

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterTindakan.findUnique({ where: { id } });
  }

  const record = await prisma.masterTindakan.update({ where: { id }, data });
  await logAudit(userId, 'master_tindakan', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.masterTindakan.findUnique({ where: { id } });
  }
  const record = await prisma.masterTindakan.delete({ where: { id } });
  await logAudit(userId, 'master_tindakan', id, 'delete', oldRecord, null);
  return record;
}

module.exports = { getAll, create, update, remove };
