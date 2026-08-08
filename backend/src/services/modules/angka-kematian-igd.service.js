const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');
const { isPeriodClosed } = require('../../middleware/periodLock');

const baseService = createGenericService('angkaKematian', {
  defaultWhere: { lokasi: 'igd' },
  beforeCreate(data) {
    return { ...data, lokasi: 'igd' };
  },
  beforeUpdate(data) {
    return { ...data, lokasi: 'igd' };
  },
  async calculateSummary(data, where) {
    const total = data.length;
    const pId = parseInt(where?.periode_id || 0);
    const uId = parseInt(where?.unit_id || 0);

    const summary = await prisma.periodeAngkaKematianIgdSummary.findFirst({
      where: { periode_id: pId, unit_id: uId }
    });

    const kasusKematian = total;
    let denominator = summary ? summary.total_pasien : 0;
    if (denominator <= 0) {
      denominator = total;
    }

    const numerator = kasusKematian;
    const persen = denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator,
      denominator,
      jumlahKematian: kasusKematian,
      persen,
      standar: '0%'
    };

  }
});

const service = {
  ...baseService,
  async getSummaryData(periodeId, unitId) {
    const pId = parseInt(periodeId || 0);
    const uId = parseInt(unitId || 0);
    let summary = await prisma.periodeAngkaKematianIgdSummary.findFirst({
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

    if (await isPeriodClosed(pId)) {
      const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
      err.statusCode = 403;
      throw err;
    }

    return prisma.periodeAngkaKematianIgdSummary.upsert({
      where: {
        periode_id_unit_id: { periode_id: pId, unit_id: uId }
      },
      update: { total_pasien: totalPasien },
      create: { periode_id: pId, unit_id: uId, total_pasien: totalPasien }
    });
  }
};

module.exports = service;

