const { createGenericService } = require('./generic.service');

const service = createGenericService('asesmenAwalIgd', {
  calculateSummary(data) {
    const total = data.length;
    const patuh = data.filter(d =>
      d.anamnesis === 'ada' &&
      d.ttv === 'ada' &&
      d.tb === 'ada' &&
      d.bb === 'ada' &&
      d.diagnosis === 'ada' &&
      d.terapi === 'ada'
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
