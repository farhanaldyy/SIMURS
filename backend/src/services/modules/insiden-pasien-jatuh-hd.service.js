const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');
const { isPeriodClosed } = require('../../middleware/periodLock');

const service = createGenericService('insidenPasienJatuhHd', {
  ignoreUnitId: true,
  async calculateSummary(data, whereQuery) {
    const total = data.length;
    let totalPasien = 0;

    if (whereQuery && whereQuery.periode_id) {
      const summaryRecord = await prisma.periodeInsidenPasienJatuhHdSummary.findUnique({
        where: { periode_id: parseInt(whereQuery.periode_id, 10) }
      });
      if (summaryRecord) {
        totalPasien = summaryRecord.total_pasien || 0;
      }
    }

    const persen = totalPasien > 0 ? parseFloat(((total / totalPasien) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator: total,
      denominator: totalPasien,
      persen,
      standar: '0%'
    };
  }
});

service.getSummaryData = async function(periodeId) {
  if (!periodeId) return { total_pasien: 0 };
  const record = await prisma.periodeInsidenPasienJatuhHdSummary.findUnique({
    where: { periode_id: parseInt(periodeId, 10) }
  });
  return record || { periode_id: parseInt(periodeId, 10), total_pasien: 0 };
};

service.upsertSummaryData = async function(periodeId, data) {
  const pid = parseInt(periodeId, 10);
  const totalPasien = parseInt(data.total_pasien, 10) || 0;

  if (await isPeriodClosed(pid)) {
    const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
    err.statusCode = 403;
    throw err;
  }

  return prisma.periodeInsidenPasienJatuhHdSummary.upsert({
    where: { periode_id: pid },
    update: { total_pasien: totalPasien },
    create: { periode_id: pid, total_pasien: totalPasien }
  });
};

module.exports = service;
