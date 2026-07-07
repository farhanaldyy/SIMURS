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
    prisma.kepatuhanKebersihanTangan.findMany({ 
      where, 
      skip, 
      take: limit, 
      orderBy: { tanggal: 'desc' },
      include: { masterTindakan: true }
    }),
    prisma.kepatuhanKebersihanTangan.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.tindakan_id !== undefined) {
    data.tindakan_id = data.tindakan_id ? parseInt(data.tindakan_id) : null;
  }
  
  // Normalize boolean moments and gloves
  ['momen_1', 'momen_2', 'momen_3', 'momen_4', 'momen_5'].forEach(f => {
    if (data[f] !== undefined) {
      data[f] = data[f] === true || data[f] === 'true';
    }
  });
  if (data.gloves !== undefined) {
    data.gloves = data.gloves === true || data.gloves === 'true';
  }

  const record = await prisma.kepatuhanKebersihanTangan.create({ data });
  await logAudit(userId, 'kepatuhan_kebersihan_tangan', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.tindakan_id !== undefined) {
    data.tindakan_id = data.tindakan_id ? parseInt(data.tindakan_id) : null;
  }
  
  // Normalize boolean moments and gloves
  ['momen_1', 'momen_2', 'momen_3', 'momen_4', 'momen_5'].forEach(f => {
    if (data[f] !== undefined) {
      data[f] = data[f] === true || data[f] === 'true';
    }
  });
  if (data.gloves !== undefined) {
    data.gloves = data.gloves === true || data.gloves === 'true';
  }

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.kepatuhanKebersihanTangan.findUnique({ where: { id } });
  }

  const record = await prisma.kepatuhanKebersihanTangan.update({ where: { id }, data });
  await logAudit(userId, 'kepatuhan_kebersihan_tangan', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.kepatuhanKebersihanTangan.findUnique({ where: { id } });
  }
  const record = await prisma.kepatuhanKebersihanTangan.delete({ where: { id } });
  await logAudit(userId, 'kepatuhan_kebersihan_tangan', id, 'delete', oldRecord, null);
  return record;
}

async function getSummary(where) {
  const data = await prisma.kepatuhanKebersihanTangan.findMany({ where });
  const total = data.length;

  // Numerator: count where action is 'hr', 'hw', or 'hr_hw' (compliant)
  const compliantCount = data.filter(d => d.tindakan === 'hr' || d.tindakan === 'hw' || d.tindakan === 'hr_hw').length;
  const persen = total > 0 ? Math.round((compliantCount / total) * 100) : 0;

  return {
    total,
    numerator: compliantCount,
    denominator: total,
    persen,
    standar: '≥ 85%',
    category: 'Keselamatan Pasien'
  };
}

module.exports = { getAll, create, update, remove, getSummary };
