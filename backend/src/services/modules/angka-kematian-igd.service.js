const { createGenericService } = require('./generic.service');

const service = createGenericService('angkaKematian', {
  defaultWhere: { lokasi: 'igd' },
  beforeCreate(data) {
    return { ...data, lokasi: 'igd' };
  },
  beforeUpdate(data) {
    return { ...data, lokasi: 'igd' };
  },
  calculateSummary(data) {
    const totalKematian = data.length;
    return {
      total: totalKematian,
      numerator: totalKematian,
      persen: 0,
      standar: '-'
    };
  }
});

module.exports = service;
