const { createGenericService } = require('./generic.service');

const service = createGenericService('rehabKepatuhanIdentitas', {
  beforeCreate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jkp = parseInt(data.jumlah_ketidakpatuhan) || 0;
    data.hasil = jp > 0 ? parseFloat(((jp - jkp) / jp * 100).toFixed(2)) : 100;
    return data;
  },
  beforeUpdate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jkp = parseInt(data.jumlah_ketidakpatuhan) || 0;
    data.hasil = jp > 0 ? parseFloat(((jp - jkp) / jp * 100).toFixed(2)) : 100;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalPasien = 0;
    let totalKetidakpatuhan = 0;
    data.forEach(d => {
      totalPasien += d.jumlah_pasien || 0;
      totalKetidakpatuhan += d.jumlah_ketidakpatuhan || 0;
    });
    const persen = totalPasien > 0 ? parseFloat(((totalPasien - totalKetidakpatuhan) / totalPasien * 100).toFixed(2)) : 100;
    return {
      total,
      total_pasien: totalPasien,
      total_ketidakpatuhan: totalKetidakpatuhan,
      numerator: totalPasien - totalKetidakpatuhan,
      denominator: totalPasien,
      persen,
      standar: '100%',
      category: 'Rehabilitasi Medis'
    };
  }
});

module.exports = service;
