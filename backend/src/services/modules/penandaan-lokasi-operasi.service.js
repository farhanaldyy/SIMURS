const { createGenericService } = require('./generic.service');

const service = createGenericService('penandaanLokasiOperasi', {
  ignoreUnitId: true,
  calculateSummary(data) {
    const total = data.length;
    const applicable = data.filter(d => d.not_applicable === false);
    const denominator = applicable.length;
    const patuh = applicable.filter(d => d.dilakukan === true).length;
    const persen = denominator > 0 ? ((patuh / denominator) * 100).toFixed(2) : 0;
    return {
      total,
      numerator: patuh,
      denominator,
      persen,
      standar: '100%'
    };
  }
});

module.exports = service;
