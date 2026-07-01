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
  const record = await prisma.identifikasiPasien.create({ data });
  await logAudit(userId, 'identifikasiPasien', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.tanggal && typeof data.tanggal === 'string') {
    data.tanggal = new Date(data.tanggal);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  sanitizeIdentifikasi(data);

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.identifikasiPasien.findUnique({ where: { id } });
  }

  const record = await prisma.identifikasiPasien.update({ where: { id }, data });
  await logAudit(userId, 'identifikasiPasien', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.identifikasiPasien.findUnique({ where: { id } });
  }
  const record = await prisma.identifikasiPasien.delete({ where: { id } });
  await logAudit(userId, 'identifikasiPasien', id, 'delete', oldRecord, null);
  return record;
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
