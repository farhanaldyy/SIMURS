const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');
const { isPeriodClosed } = require('../../middleware/periodLock');

const baseService = createGenericService('kembaliIcu', {
  ignoreUnitId: true,
  async calculateSummary(data, where) {
    const total = data.length;
    const pId = parseInt(where?.periode_id || 0);

    const summary = await prisma.periodeKembaliIcuSummary.findUnique({
      where: { periode_id: pId }
    });

    const numerator = total;
    const denominator = summary ? summary.total_pasien : 0;
    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator,
      denominator,
      persen,
      standar: '0%'
    };
  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId) {
    const pId = parseInt(periodeId || 0);
    let summary = await prisma.periodeKembaliIcuSummary.findUnique({
      where: { periode_id: pId }
    });
    if (!summary) {
      summary = { periode_id: pId, total_pasien: 0 };
    }
    return summary;
  },

  async upsertSummaryData(periodeId, body) {
    const pId = parseInt(periodeId || 0);
    const totalPasien = parseInt(body.total_pasien || 0);

    if (await isPeriodClosed(pId)) {
      const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
      err.statusCode = 403;
      throw err;
    }

    return prisma.periodeKembaliIcuSummary.upsert({
      where: { periode_id: pId },
      update: { total_pasien: totalPasien },
      create: { periode_id: pId, total_pasien: totalPasien }
    });
  }
};

module.exports = service;

