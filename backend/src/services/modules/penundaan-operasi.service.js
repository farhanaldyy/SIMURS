const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

function extractHHMM(jam) {
  if (!jam) return '00:00';
  if (jam instanceof Date) {
    return `${String(jam.getHours()).padStart(2, '0')}:${String(jam.getMinutes()).padStart(2, '0')}`;
  }
  const str = String(jam);
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

const baseService = createGenericService('penundaanOperasi', {
  ignoreUnitId: true,
  beforeCreate(data) {
    if (data.batal === true || data.batal === 'true') {
      data.waktu_tunggu_menit = 0;
    } else if (data.jadwal_jam_operasi && data.jam_mulai_operasi) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    }
    return data;
  },
  beforeUpdate(data) {
    if (data.batal === true || data.batal === 'true') {
      data.waktu_tunggu_menit = 0;
    } else if (data.jadwal_jam_operasi && data.jam_mulai_operasi) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    }
    return data;
  },
  async calculateSummary(data, where) {
    const total = data.length;
    const pId = where && where.periode_id ? parseInt(where.periode_id) : null;
    
    // Find summary parameter for the period
    const summary = pId ? await prisma.periodePenundaanSummary.findUnique({
      where: { periode_id: pId }
    }) : null;
    const totalPasienInput = summary ? summary.total_pasien : 0;

    // Numerator (N): Data Penundaan (Count of delay incidents in table without medical indication exemption)
    const delayedCount = data.filter(d => d.indikasi_medis !== true).length;

    const numerator = delayedCount;
    let denominator = totalPasienInput;
    if (denominator <= 0) {
      denominator = total;
    }

    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;
    return {
      total,
      numerator,
      denominator,
      persen,
      standar: '≤ 5%'
    };
  }
});

const service = {
  ...baseService,
  async getAll(where, page, limit) {
    const res = await baseService.getAll(where, page, limit);
    
    // Find the standard threshold for the period
    const pId = where.periode_id ? parseInt(where.periode_id) : null;
    let threshold = 60;
    if (pId) {
      const summary = await prisma.periodePenundaanSummary.findUnique({
        where: { periode_id: pId }
      });
      if (summary) threshold = summary.standar_menit;
    }

    res.data = res.data.map(d => {
      const isBatal = d.batal === true;
      let waktuTunggu = d.waktu_tunggu_menit;
      if (!isBatal && d.jadwal_jam_operasi && d.jam_mulai_operasi) {
        waktuTunggu = Math.round(hitungSelisihMenit(d.jadwal_jam_operasi, d.jam_mulai_operasi));
      }
      const isWithinThreshold = waktuTunggu <= threshold;
      const hasIndikasiMedis = d.indikasi_medis === true;
      const isPatuh = !isBatal && (isWithinThreshold || hasIndikasiMedis);
      return {
        ...d,
        waktu_tunggu_menit: waktuTunggu,
        standar_menit: threshold,
        patuh: isPatuh
      };
    });

    return res;
  },

  async getSummaryData(periodeId) {
    let summary = await prisma.periodePenundaanSummary.findUnique({
      where: { periode_id: parseInt(periodeId) }
    });
    if (!summary) {
      summary = { periode_id: parseInt(periodeId), standar_menit: 60, total_pasien: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, body) {
    const pId = parseInt(periodeId);
    const standarMenit = parseInt(body.standar_menit || 60);
    const totalPasien = parseInt(body.total_pasien || 0);

    return prisma.periodePenundaanSummary.upsert({
      where: { periode_id: pId },
      update: { standar_menit: standarMenit, total_pasien: totalPasien },
      create: { periode_id: pId, standar_menit: standarMenit, total_pasien: totalPasien }
    });
  }
};

module.exports = service;
