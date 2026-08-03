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

function parseTimeToUtcDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const str = String(val).trim();
  if (str.includes('T')) {
    const timePart = str.split('T')[1].replace('Z', '');
    const parts = timePart.split(':');
    const hh = String(parts[0]).padStart(2, '0');
    const mm = String(parts[1]).padStart(2, '0');
    return new Date(`1970-01-01T${hh}:${mm}:00.000Z`);
  }
  const parts = str.split(':');
  const hh = String(parts[0] || '0').padStart(2, '0');
  const mm = String(parts[1] || '0').padStart(2, '0');
  return new Date(`1970-01-01T${hh}:${mm}:00.000Z`);
}

function extractHHMM(jam) {
  if (!jam) return '00:00';
  if (jam instanceof Date) {
    return `${String(jam.getUTCHours()).padStart(2, '0')}:${String(jam.getUTCMinutes()).padStart(2, '0')}`;
  }
  const str = String(jam);
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    }
  }
  return str.substring(0, 5);
}

function hitungSelisihMenit(jam1, jam2) {
  const time1 = extractHHMM(jam1);
  const time2 = extractHHMM(jam2);

  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);

  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 1440;
  return diff;
}

async function getAll(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.waktuTanggapSc.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.waktuTanggapSc.count({ where }),
  ]);

  const pId = where.periode_id ? parseInt(where.periode_id) : null;
  let threshold = 30;
  if (pId) {
    const summary = await prisma.periodeWaktuTanggapScSummary.findUnique({
      where: { periode_id: pId }
    });
    if (summary && summary.standar_menit) threshold = summary.standar_menit;
  }

  const mappedData = data.map(d => ({
    ...d,
    standar_menit: threshold,
    patuh: d.selisih_menit <= threshold
  }));

  return { data: mappedData, total };
}

async function create(body, userId) {
  const data = { ...body, created_by: userId };
  
  if (data.jam_ditentukan_operasi) {
    data.jam_ditentukan_operasi = parseTimeToUtcDate(data.jam_ditentukan_operasi);
  }
  if (data.jam_sayatan_pertama) {
    data.jam_sayatan_pertama = parseTimeToUtcDate(data.jam_sayatan_pertama);
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

  if (data.jam_ditentukan_operasi) {
    data.jam_ditentukan_operasi = parseTimeToUtcDate(data.jam_ditentukan_operasi);
  }
  if (data.jam_sayatan_pertama) {
    data.jam_sayatan_pertama = parseTimeToUtcDate(data.jam_sayatan_pertama);
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
  
  const pId = where && where.periode_id ? parseInt(where.periode_id) : null;
  let threshold = 30;
  let totalPasienInput = 0;

  if (pId) {
    const summary = await prisma.periodeWaktuTanggapScSummary.findUnique({
      where: { periode_id: pId }
    });
    if (summary) {
      if (summary.standar_menit) threshold = summary.standar_menit;
      if (summary.total_pasien) totalPasienInput = summary.total_pasien;
    }
  }

  const tepat = data.filter(d => d.selisih_menit <= threshold).length;
  let denominator = totalPasienInput > 0 ? totalPasienInput : total;
  const persen = denominator > 0 ? parseFloat(((tepat / denominator) * 100).toFixed(2)) : 0;

  return {
    total,
    numerator: tepat,
    denominator,
    persen,
    standar: '≥ 80%'
  };
}

async function getSummaryData(periodeId) {
  let summary = await prisma.periodeWaktuTanggapScSummary.findUnique({
    where: { periode_id: parseInt(periodeId) }
  });
  if (!summary) {
    summary = { periode_id: parseInt(periodeId), standar_menit: 30, total_pasien: 0 };
  }
  return summary;
}

async function upsertSummaryData(periodeId, body) {
  const pId = parseInt(periodeId);
  const standarMenit = parseInt(body.standar_menit || 30);
  const totalPasien = parseInt(body.total_pasien || 0);

  return prisma.periodeWaktuTanggapScSummary.upsert({
    where: { periode_id: pId },
    update: { standar_menit: standarMenit, total_pasien: totalPasien },
    create: { periode_id: pId, standar_menit: standarMenit, total_pasien: totalPasien }
  });
}

module.exports = { getAll, create, update, remove, getSummary, getSummaryData, upsertSummaryData };
