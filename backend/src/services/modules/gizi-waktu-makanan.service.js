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
    prisma.giziWaktuMakanan.findMany({ where, skip, take: limit, orderBy: { tanggal: 'desc' } }),
    prisma.giziWaktuMakanan.count({ where }),
  ]);
  return { data, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.jumlah_tepat_waktu !== undefined) data.jumlah_tepat_waktu = parseInt(data.jumlah_tepat_waktu);
  if (data.jumlah_porsi !== undefined) data.jumlah_porsi = parseInt(data.jumlah_porsi);
  
  data.persentase = data.jumlah_porsi > 0 ? Math.round((data.jumlah_tepat_waktu / data.jumlah_porsi) * 100) : 0;

  const record = await prisma.giziWaktuMakanan.create({ data });
  await logAudit(userId, 'gizi_waktu_makanan', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
  if (data.jumlah_tepat_waktu !== undefined) data.jumlah_tepat_waktu = parseInt(data.jumlah_tepat_waktu);
  if (data.jumlah_porsi !== undefined) data.jumlah_porsi = parseInt(data.jumlah_porsi);
  
  if (data.jumlah_tepat_waktu !== undefined && data.jumlah_porsi !== undefined) {
    data.persentase = data.jumlah_porsi > 0 ? Math.round((data.jumlah_tepat_waktu / data.jumlah_porsi) * 100) : 0;
  }

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.giziWaktuMakanan.findUnique({ where: { id } });
  }

  const record = await prisma.giziWaktuMakanan.update({ where: { id }, data });
  await logAudit(userId, 'gizi_waktu_makanan', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.giziWaktuMakanan.findUnique({ where: { id } });
  }
  const record = await prisma.giziWaktuMakanan.delete({ where: { id } });
  await logAudit(userId, 'gizi_waktu_makanan', id, 'delete', oldRecord, null);
  return record;
}

async function getSummary(where) {
  const data = await prisma.giziWaktuMakanan.findMany({ where });
  const total = data.length;
  
  let total_numerator = 0;
  let total_denominator = 0;
  data.forEach(d => {
    total_numerator += d.jumlah_tepat_waktu || 0;
    total_denominator += d.jumlah_porsi || 0;
  });

  const avg_numerator = total > 0 ? parseFloat((total_numerator / total).toFixed(1)) : 0;
  const avg_denominator = total > 0 ? parseFloat((total_denominator / total).toFixed(1)) : 0;
  const persen = total_denominator > 0 ? Math.round((total_numerator / total_denominator) * 100) : 0;

  return {
    total,
    numerator: total_numerator,
    denominator: total_denominator,
    total_numerator,
    avg_numerator,
    total_denominator,
    avg_denominator,
    persen,
    standar: '> 90%',
    category: 'Gizi'
  };
}

module.exports = { getAll, create, update, remove, getSummary };
