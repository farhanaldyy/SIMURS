const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('ketidakpatuhanHd', {
  ignoreUnitId: true,
  async calculateSummary(data, where) {
    const totalMissed = data.length;
    
    // Find summary for the period
    const summary = await prisma.periodeHdSummary.findUnique({
      where: { periode_id: where.periode_id }
    });

    const totalPasien = summary ? summary.total_pasien_hd : 0;
    const denominator = totalPasien * 8; // 2 times/week * 4 weeks
    const persen = denominator > 0 ? (100 - (totalMissed / denominator) * 100).toFixed(2) : 100;

    return {
      total: totalMissed,
      numerator: totalMissed,
      denominator,
      persen,
      standar: '-'
    };
  }
});

// Add extra methods for managing the summary data
const service = {
  ...baseService,
  async getSummaryData(periodeId) {
    let summary = await prisma.periodeHdSummary.findUnique({
      where: { periode_id: parseInt(periodeId) }
    });
    if (!summary) {
      // Return default
      summary = { periode_id: parseInt(periodeId), total_pasien_hd: 0, total_avgraft_avf: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, body) {
    const pId = parseInt(periodeId);
    const totalPasien = parseInt(body.total_pasien_hd || 0);
    const totalAvgraft = parseInt(body.total_avgraft_avf || 0);

    return prisma.periodeHdSummary.upsert({
      where: { periode_id: pId },
      update: { total_pasien_hd: totalPasien, total_avgraft_avf: totalAvgraft },
      create: { periode_id: pId, total_pasien_hd: totalPasien, total_avgraft_avf: totalAvgraft }
    });
  }
};

module.exports = service;
