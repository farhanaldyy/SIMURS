const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('doubleCheckHighAlert', {
  async calculateSummary(data, where) {
    const numerator = data.length;
    const pId = parseInt(where?.periode_id || 0);
    const uId = parseInt(where?.unit_id || 0);

    const summary = await prisma.periodeDoubleCheckSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });

    const denominator = summary ? summary.total_pasien_high_alert : 0;
    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;

    return {
      total: numerator,
      numerator,
      denominator,
      persen,
      standar: '≥ 80%'
    };
  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId, unitId) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    let summary = await prisma.periodeDoubleCheckSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });
    if (!summary) {
      summary = { periode_id: pId, unit_id: uId, total_pasien_high_alert: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, unitId, body) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    const totalPasien = parseInt(body.total_pasien_high_alert || 0);

    return prisma.periodeDoubleCheckSummary.upsert({
      where: {
        periode_id_unit_id: { periode_id: pId, unit_id: uId }
      },
      update: { total_pasien_high_alert: totalPasien },
      create: { periode_id: pId, unit_id: uId, total_pasien_high_alert: totalPasien }
    });
  }
};

module.exports = service;
