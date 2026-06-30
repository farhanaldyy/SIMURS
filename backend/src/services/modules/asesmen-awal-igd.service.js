const { createGenericService } = require('./generic.service');

function normalizeInput(input) {
  if (input.anamnesis === 'tidak ada') input.anamnesis = 'tidak_ada';
  if (input.ttv === 'tidak ada') input.ttv = 'tidak_ada';
  if (input.tb === 'tidak ada') input.tb = 'tidak_ada';
  if (input.bb === 'tidak ada') input.bb = 'tidak_ada';
  if (input.diagnosis === 'tidak ada') input.diagnosis = 'tidak_ada';
  if (input.terapi === 'tidak ada') input.terapi = 'tidak_ada';
  return input;
}

const service = createGenericService('asesmenAwalIgd', {
  beforeCreate(input) {
    return normalizeInput(input);
  },
  beforeUpdate(input) {
    return normalizeInput(input);
  },

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
