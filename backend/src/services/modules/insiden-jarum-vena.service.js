const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('insidenJarumVena', {
  ignoreUnitId: true,
  async calculateSummary(data, where) {
    const totalIncidents = data.length;
    
    // Find summary for the period
    const summary = await prisma.periodeJarumVenaSummary.findUnique({
      where: { periode_id: where.periode_id }
    });

    const totalPemasangan = summary ? summary.total_pemasangan_bulan : 0;

    return {
      total: totalIncidents,
      numerator: totalIncidents,
      denominator: totalPemasangan,
      persen: '-',
      standar: '0'
    };
  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId) {
    let summary = await prisma.periodeJarumVenaSummary.findUnique({
      where: { periode_id: parseInt(periodeId) }
    });
    if (!summary) {
      summary = { periode_id: parseInt(periodeId), total_pemasangan_bulan: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, body) {
    const pId = parseInt(periodeId);
    const totalPemasangan = parseInt(body.total_pemasangan_bulan || 0);

    return prisma.periodeJarumVenaSummary.upsert({
      where: { periode_id: pId },
      update: { total_pemasangan_bulan: totalPemasangan },
      create: { periode_id: pId, total_pemasangan_bulan: totalPemasangan }
    });
  }
};

module.exports = service;
