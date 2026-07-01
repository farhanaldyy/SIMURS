const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

function hitungSelisihMenit(jam1, jam2) {
  const j1 = typeof jam1 === 'string' ? jam1 : jam1.toTimeString().split(' ')[0];
  const j2 = typeof jam2 === 'string' ? jam2 : jam2.toTimeString().split(' ')[0];

  const d1 = new Date(`2000-01-01T${j1}`);
  const d2 = new Date(`2000-01-01T${j2}`);
  let diff = (d2 - d1) / 60000;
  if (diff < 0) diff += 1440;
  return diff;
}

const baseService = createGenericService('penundaanOperasi', {
  ignoreUnitId: true,
  beforeCreate(data) {
    if (data.batal === true || data.batal === 'true') {
      data.waktu_tunggu_menit = 0;
    } else {
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
    
    // Find summary parameter for the period
    const summary = await prisma.periodePenundaanSummary.findUnique({
      where: { periode_id: where.periode_id }
    });
    const threshold = summary ? summary.standar_menit : 60;

    // Compliance (PATUH N) is: not cancelled AND (wait time <= threshold OR hasIndikasiMedis)
    const compliant = data.filter(d => {
      const isBatal = d.batal === true;
      const isWithinThreshold = d.waktu_tunggu_menit <= threshold;
      const hasIndikasiMedis = d.indikasi_medis === true;
      return !isBatal && (isWithinThreshold || hasIndikasiMedis);
    }).length;

    const persen = total > 0 ? ((compliant / total) * 100).toFixed(2) : 100;
    return {
      total,
      numerator: compliant,
      persen,
      standar: '≥ 95%'
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
      const isWithinThreshold = d.waktu_tunggu_menit <= threshold;
      const hasIndikasiMedis = d.indikasi_medis === true;
      const isPatuh = !isBatal && (isWithinThreshold || hasIndikasiMedis);
      return {
        ...d,
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
      summary = { periode_id: parseInt(periodeId), standar_menit: 60 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, body) {
    const pId = parseInt(periodeId);
    const standarMenit = parseInt(body.standar_menit || 60);

    return prisma.periodePenundaanSummary.upsert({
      where: { periode_id: pId },
      update: { standar_menit: standarMenit },
      create: { periode_id: pId, standar_menit: standarMenit }
    });
  }
};

module.exports = service;
