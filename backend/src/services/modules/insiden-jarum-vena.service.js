const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');
const { isPeriodClosed } = require('../../middleware/periodLock');

const baseService = createGenericService('insidenJarumVena', {
  ignoreUnitId: true,
  async calculateSummary(data, where) {
    const totalIncidents = data.length;
    let totalPemasangan = 0;

    if (where && where.periode_id) {
      const summary = await prisma.periodeJarumVenaSummary.findUnique({
        where: { periode_id: parseInt(where.periode_id, 10) }
      });
      if (summary) {
        totalPemasangan = summary.total_pemasangan_bulan || 0;
      }
    }

    const persen = totalPemasangan > 0 ? parseFloat(((totalIncidents / totalPemasangan) * 100).toFixed(2)) : 0;

    return {
      total: totalIncidents,
      numerator: totalIncidents,
      denominator: totalPemasangan,
      persen,
      standar: '0%'
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

    if (await isPeriodClosed(pId)) {
      const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
      err.statusCode = 403;
      throw err;
    }

    return prisma.periodeJarumVenaSummary.upsert({
      where: { periode_id: pId },
      update: { total_pemasangan_bulan: totalPemasangan },
      create: { periode_id: pId, total_pemasangan_bulan: totalPemasangan }
    });
  }
};

module.exports = service;
