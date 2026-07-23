const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('angkaKematian', {
  defaultWhere: { lokasi: 'ranap' },
  beforeCreate(data) {
    return { ...data, lokasi: 'ranap' };
  },
  beforeUpdate(data) {
    return { ...data, lokasi: 'ranap' };
  },
  async calculateSummary(data, where) {
    const numerator = data.length;
    const pId = parseInt(where?.periode_id || 0);
    const uId = parseInt(where?.unit_id || 0);

    const summary = await prisma.periodeAngkaKematianRanapSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });

    const denominator = summary ? summary.total_pasien : 0;
    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;

    return {
      total: numerator,
      numerator,
      denominator,
      persen,
      standar: '≤ 0.24%'
    };
  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId, unitId) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    let summary = await prisma.periodeAngkaKematianRanapSummary.findFirst({
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

    return prisma.periodeAngkaKematianRanapSummary.upsert({
      where: {
        periode_id_unit_id: { periode_id: pId, unit_id: uId }
      },
      update: { total_pasien: totalPasien },
      create: { periode_id: pId, unit_id: uId, total_pasien: totalPasien }
    });
  }
};

module.exports = service;
