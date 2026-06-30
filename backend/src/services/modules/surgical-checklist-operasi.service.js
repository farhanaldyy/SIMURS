const { createGenericService } = require('./generic.service');

const service = createGenericService('surgicalChecklist', {
  defaultWhere: { jenis: 'operasi_umum' },
  beforeCreate(data) {
    return { ...data, jenis: 'operasi_umum' };
  },
  beforeUpdate(data) {
    return { ...data, jenis: 'operasi_umum' };
  },
  calculateSummary(data) {
    const total = data.length;
    const patuh = data.filter(d => d.sign_in === true && d.time_out === true && d.sign_out === true).length;
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
