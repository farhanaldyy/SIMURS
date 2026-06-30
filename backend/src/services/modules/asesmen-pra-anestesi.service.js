const { createGenericService } = require('./generic.service');

const service = createGenericService('asesmenPraOperasi', {
  beforeCreate(data) {
    return { ...data, jenis: 'pra_anestesi' };
  },
  beforeUpdate(data) {
    return { ...data, jenis: 'pra_anestesi' };
  },
  calculateSummary(data) {
    const total = data.length;
    const patuh = data.filter(d => d.diisi === true).length;
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
