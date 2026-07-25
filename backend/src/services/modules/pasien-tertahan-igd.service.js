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

const baseService = createGenericService('pasienTertahanIgd', {
  beforeCreate(data) {
    data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jam_masuk, data.jam_pindah_ruangan));
    return data;
  },
  beforeUpdate(data) {
    if (data.jam_masuk && data.jam_pindah_ruangan) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jam_masuk, data.jam_pindah_ruangan));
    }
    return data;
  },
  async calculateSummary(data, where) {
    const total = data.length;
    const pId = parseInt(where?.periode_id || 0);
    const uId = parseInt(where?.unit_id || 0);

    const summary = await prisma.periodePasienTertahanIgdSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });

    const tertahan = total;
    let denominator = summary ? summary.total_pasien : 0;
    if (denominator <= 0) {
      denominator = total;
    }


    const numerator = Math.max(0, denominator - tertahan);
    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 100;



    return {
      total,
      numerator,
      denominator,
      jumlahTertahan: tertahan,
      persen,
      standar: '100%'
    };
  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId, unitId) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    let summary = await prisma.periodePasienTertahanIgdSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });
    if (!summary) {
      summary = { periode_id: pId, unit_id: uId, total_pasien: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, unitId, body) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    const totalPasien = parseInt(body.total_pasien || 0);

    return prisma.periodePasienTertahanIgdSummary.upsert({
      where: {
        periode_id_unit_id: { periode_id: pId, unit_id: uId }
      },
      update: { total_pasien: totalPasien },
      create: { periode_id: pId, unit_id: uId, total_pasien: totalPasien }
    });
  }
};

module.exports = service;

