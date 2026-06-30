const { createGenericService } = require('./generic.service');

const baseService = createGenericService('asesmenPraOperasi', {
  defaultWhere: { jenis: 'pra_bedah' },
  beforeCreate(data) {
    return { ...data, jenis: 'pra_bedah' };
  },
  beforeUpdate(data) {
    return { ...data, jenis: 'pra_bedah' };
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
    const { also_save_pra_anestesi, ...rest } = body;

    // Create the pra_bedah record
    const record = await baseService.create(rest, userId);

    // If requested, also create the pra_anestesi record in the same table
    if (also_save_pra_anestesi === true || also_save_pra_anestesi === 'true') {
      const anestesiService = require('./asesmen-pra-anestesi.service');
      await anestesiService.create(rest, userId);
    }

    return record;
  }
};

module.exports = service;
