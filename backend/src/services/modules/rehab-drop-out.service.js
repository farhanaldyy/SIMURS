const { createGenericService } = require('./generic.service');

const service = createGenericService('rehabPasienDropOut', {
  beforeCreate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jdo = parseInt(data.jumlah_drop_out) || 0;
    data.hasil = jp > 0 ? parseFloat((((jp - jdo) / jp) * 100).toFixed(2)) : 100;
    return data;
  },
  beforeUpdate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jdo = parseInt(data.jumlah_drop_out) || 0;
    data.hasil = jp > 0 ? parseFloat((((jp - jdo) / jp) * 100).toFixed(2)) : 100;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalPasien = 0;
    let totalDropOut = 0;
    let sumHasil = 0;
    data.forEach(d => {
      totalPasien += d.jumlah_pasien || 0;
      totalDropOut += d.jumlah_drop_out || 0;
      sumHasil += d.hasil || 0;
    });
    const persen = total > 0 ? parseFloat((sumHasil / total).toFixed(2)) : 100;
    return {
      total,
      total_pasien: totalPasien,
      total_drop_out: totalDropOut,
      numerator: totalDropOut,
      denominator: totalPasien,
      persen,
      standar: '≥ 50%',
      category: 'Rehabilitasi Medis'
    };
  }
});

module.exports = service;
