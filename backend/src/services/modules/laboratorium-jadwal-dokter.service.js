const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumJadwalDokter', {
  calculateSummary(data) {
    return {
      total: data.length,
      standar: '-'
    };
  }
});

module.exports = baseService;
