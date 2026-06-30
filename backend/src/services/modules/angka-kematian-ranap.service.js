const { createGenericService } = require('./generic.service');

const service = createGenericService('angkaKematian', {
  beforeCreate(data) {
    return { ...data, lokasi: 'ranap' };
  },
  beforeUpdate(data) {
    return { ...data, lokasi: 'ranap' };
  },
  calculateSummary(data) {
    // Under Ranap, every record is a death.
    const totalKematian = data.length;
    return {
      total: totalKematian,
      numerator: totalKematian,
      persen: 0, // In template, it's just raw number of deaths or percentage calculated relative to overall admissions.
      standar: '-'
    };
  }
});

module.exports = service;
