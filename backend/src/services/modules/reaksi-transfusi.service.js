const { createGenericService } = require('./generic.service');

const service = createGenericService('reaksiTransfusi', {
  calculateSummary(data) {
    const totalTransfusi = data.reduce((acc, curr) => acc + curr.darah_masuk_kolf, 0);
    const totalReaksi = data.filter(d => d.ada_reaksi).length;
    const persen = totalTransfusi > 0 ? ((totalReaksi / totalTransfusi) * 100).toFixed(4) : 0;
    return {
      total: data.length,
      numerator: totalReaksi,
      denominator: totalTransfusi,
      persen,
      standar: '< 0.01%'
    };
  }
});

module.exports = service;
