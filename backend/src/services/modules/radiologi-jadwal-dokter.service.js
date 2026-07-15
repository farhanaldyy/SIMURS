const { createGenericService } = require('./generic.service');

const baseService = createGenericService('radiologiJadwalDokter', {
  calculateSummary(data) {
    return {
      total: data.length,
      standar: '-'
    };
  }
});

module.exports = baseService;
