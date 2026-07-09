const { createGenericService } = require('./generic.service');

const service = createGenericService('rehabKesalahanTindakan', {
  beforeCreate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jk = parseInt(data.jumlah_kesalahan) || 0;
    data.hasil = jp > 0 ? parseFloat(((jp - jk) / jp * 100).toFixed(2)) : 100;
    return data;
  },
  beforeUpdate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jk = parseInt(data.jumlah_kesalahan) || 0;
    data.hasil = jp > 0 ? parseFloat(((jp - jk) / jp * 100).toFixed(2)) : 100;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalPasien = 0;
    let totalKesalahan = 0;
    data.forEach(d => {
      totalPasien += d.jumlah_pasien || 0;
      totalKesalahan += d.jumlah_kesalahan || 0;
    });
    const persen = totalPasien > 0 ? parseFloat(((totalPasien - totalKesalahan) / totalPasien * 100).toFixed(2)) : 100;
    return {
      total,
      total_pasien: totalPasien,
      total_kesalahan: totalKesalahan,
      numerator: totalPasien - totalKesalahan,
      denominator: totalPasien,
      persen,
      standar: '100%',
      category: 'Rehabilitasi Medis'
    };
  }
});

module.exports = service;
