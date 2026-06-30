const { createGenericService } = require('./generic.service');

const service = createGenericService('kembaliIcu', {
  ignoreUnitId: true,
  calculateSummary(data) {
    const total = data.length;
    return {
      total,
      numerator: total,
      persen: 0,
      standar: '-'
    };
  }
});

module.exports = service;
