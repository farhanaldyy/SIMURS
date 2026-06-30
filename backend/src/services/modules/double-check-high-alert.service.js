const { createGenericService } = require('./generic.service');

const service = createGenericService('doubleCheckHighAlert', {
  calculateSummary(data) {
    const total = data.length;
    return {
      total,
      numerator: total,
      persen: total > 0 ? 100 : 0,
      standar: '≥ 80%'
    };
  }
});

module.exports = service;
