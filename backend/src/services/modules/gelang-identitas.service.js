const { createGenericService } = require('./generic.service');

const service = createGenericService('gelangIdentitas', {
  calculateSummary(data) {
    const total = data.length;
    const patuh = data.filter(d =>
      d.gelang_identitas === 'dilakukan' &&
      d.alergi === 'dilakukan' &&
      d.fall_risk === 'dilakukan' &&
      (d.dnr === 'dilakukan' || d.dnr === 'tidak_dilakukan' || d.dnr === 'tidak dilakukan')
    ).length;
    const persen = total > 0 ? ((patuh / total) * 100).toFixed(2) : 0;
    return {
      total,
      numerator: patuh,
      persen,
      standar: '100%'
    };
  }
});

module.exports = service;

