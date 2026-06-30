const { createGenericService } = require('./generic.service');

const service = createGenericService('serahTerimaPasien', {
  calculateSummary(data) {
    const total = data.length;
    const patuh = data.filter(d =>
      d.akun === 'Sesuai' &&
      d.keluhan === 'Sesuai' &&
      d.ttv === 'Sesuai' &&
      d.penunjang === 'Sesuai' &&
      d.konsul === 'Sesuai' &&
      d.tindakan === 'Sesuai' &&
      d.obat === 'Sesuai'
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
