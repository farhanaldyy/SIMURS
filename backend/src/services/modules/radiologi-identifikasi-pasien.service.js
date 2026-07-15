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
    prisma.radiologiIdentifikasiPasien.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.radiologiIdentifikasiPasien.count({ where }),
  ]);

  const mappedData = data.map(d => {
    const fields = ['pemberian_obat', 'pemberian_nutrisi', 'pemberian_darah', 'pengambilan_spesimen', 'melakukan_tindakan'];
    let num = 0;
    let den = 0;
    fields.forEach(f => {
      if (d[f] !== 'tidak_ada_peluang' && d[f] !== 'tidak ada peluang') {
        den++;
        if (d[f] === 'dilakukan') num++;
      }
    });
    const hasil = den > 0 ? parseFloat(((num / den) * 100).toFixed(2)) : 100;
    return { ...d, hasil };
  });

  return { data: mappedData, total };
}

function sanitizeIdentifikasi(data) {
  const fields = ['pemberian_obat', 'pemberian_nutrisi', 'pemberian_darah', 'pengambilan_spesimen', 'melakukan_tindakan'];
  fields.forEach(f => {
    if (data[f] === 'tidak dilakukan') data[f] = 'tidak_dilakukan';
    if (data[f] === 'tidak ada peluang') data[f] = 'tidak_ada_peluang';
  });
  if (data.periode_id) data.periode_id = parseInt(data.periode_id);
  if (data.unit_id) data.unit_id = parseInt(data.unit_id);
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  if (data.tanggal && typeof data.tanggal === 'string') {
    data.tanggal = new Date(data.tanggal);
  }
  sanitizeIdentifikasi(data);
  const record = await prisma.radiologiIdentifikasiPasien.create({ data });
  await logAudit(userId, 'radiologiIdentifikasiPasien', record.id, 'create', null, record);
  return record;
}

async function update(id, body, userId) {
  const data = { ...body };
  if (data.tanggal && typeof data.tanggal === 'string') {
    data.tanggal = new Date(data.tanggal);
  }
  sanitizeIdentifikasi(data);

  // Remove read-only attributes
  delete data.id;
  delete data.created_by;
  delete data.created_at;
  delete data.updated_at;

  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.radiologiIdentifikasiPasien.findUnique({ where: { id } });
  }

  const record = await prisma.radiologiIdentifikasiPasien.update({ where: { id }, data });
  await logAudit(userId, 'radiologiIdentifikasiPasien', id, 'update', oldRecord, record);
  return record;
}

async function remove(id, userId) {
  let oldRecord = null;
  if (userId) {
    oldRecord = await prisma.radiologiIdentifikasiPasien.findUnique({ where: { id } });
  }
  const record = await prisma.radiologiIdentifikasiPasien.delete({ where: { id } });
  await logAudit(userId, 'radiologiIdentifikasiPasien', id, 'delete', oldRecord, null);
  return record;
}

async function getSummary(where) {
  const data = await prisma.radiologiIdentifikasiPasien.findMany({ where });
  const fields = ['pemberian_obat', 'pemberian_nutrisi', 'pemberian_darah', 'pengambilan_spesimen', 'melakukan_tindakan'];
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
  const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;
  return { total: data.length, numerator, denominator, persen, standar: '100%', category: 'Radiologi' };
}

module.exports = { getAll, create, update, remove, getSummary };
