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


function hitungSelisihMenit(jam1, jam2) {
  const d1 = new Date(`2000-01-01T${jam1}`);
  const d2 = new Date(`2000-01-01T${jam2}`);
  return Math.round((d2 - d1) / 60000);
}

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.waktuTanggapSc.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.waktuTanggapSc.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.jam_ditentukan_operasi && typeof data.jam_ditentukan_operasi === 'string') {
    data.jam_ditentukan_operasi = new Date(`1970-01-01T${data.jam_ditentukan_operasi}:00Z`);
  }
  if (data.jam_sayatan_pertama && typeof data.jam_sayatan_pertama === 'string') {
    data.jam_sayatan_pertama = new Date(`1970-01-01T${data.jam_sayatan_pertama}:00Z`);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  
  data.selisih_menit = hitungSelisihMenit(body.jam_ditentukan_operasi, body.jam_sayatan_pertama);
  const record = await prisma.waktuTanggapSc.create({ data });
  await logAudit(userId, 'waktuTanggapSc', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.jam_ditentukan_operasi && typeof data.jam_ditentukan_operasi === 'string') {
    data.jam_ditentukan_operasi = new Date(`1970-01-01T${data.jam_ditentukan_operasi}:00Z`);
  }
  if (data.jam_sayatan_pertama && typeof data.jam_sayatan_pertama === 'string') {
    data.jam_sayatan_pertama = new Date(`1970-01-01T${data.jam_sayatan_pertama}:00Z`);
  }
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);

  if (body.jam_ditentukan_operasi && body.jam_sayatan_pertama) {
    data.selisih_menit = hitungSelisihMenit(body.jam_ditentukan_operasi, body.jam_sayatan_pertama);
  }

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.waktuTanggapSc.findUnique({ where: { id } });
  }

  const record = await prisma.waktuTanggapSc.update({ where: { id }, data });
  await logAudit(userId, 'waktuTanggapSc', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.waktuTanggapSc.findUnique({ where: { id } });
  }
  const record = await prisma.waktuTanggapSc.delete({ where: { id } });
  await logAudit(userId, 'waktuTanggapSc', id, 'delete', oldRecord, null);
  return record;
}

async function getSummary(where) {
  const data = await prisma.waktuTanggapSc.findMany({ where });
  const total = data.length;
  const tepat = data.filter(d => d.selisih_menit <= 30).length;
  const persen = total > 0 ? ((tepat / total) * 100).toFixed(2) : 0;
  return { total, numerator: tepat, persen, standar: '≥ 80%' };
}

module.exports = { getAll, create, update, remove, getSummary };
