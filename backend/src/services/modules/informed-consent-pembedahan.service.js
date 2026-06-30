const { createGenericService } = require('./generic.service');

const baseService = createGenericService('informedConsent', {
  defaultWhere: { jenis: 'pembedahan' },
  beforeCreate(data) {
    return { ...data, jenis: 'pembedahan' };
  },
  beforeUpdate(data) {
    return { ...data, jenis: 'pembedahan' };
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

const service = {
  ...baseService,
  async create(body, userId) {
    const { also_save_anestesi, ...rest } = body;

    // Create the pembedahan record
    const record = await baseService.create(rest, userId);

    // If requested, also create the anestesi record in the same table
    if (also_save_anestesi === true || also_save_anestesi === 'true') {
      const anestesiService = require('./informed-consent-anestesi.service');
      await anestesiService.create(rest, userId);
    }

    return record;
  }
};

module.exports = service;
