const { createGenericService } = require('./generic.service');

const baseService = createGenericService('rehabPasienDropOut', {
  beforeCreate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jdo = parseInt(data.jumlah_drop_out) || 0;
    data.hasil = jp > 0 ? parseFloat(((jdo / jp) * 100).toFixed(2)) : 0;
    return data;
  },
  beforeUpdate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const jdo = parseInt(data.jumlah_drop_out) || 0;
    data.hasil = jp > 0 ? parseFloat(((jdo / jp) * 100).toFixed(2)) : 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalPasien = 0;
    let totalDropOut = 0;
    data.forEach(d => {
      totalPasien += d.jumlah_pasien || 0;
      totalDropOut += d.jumlah_drop_out || 0;
    });
    const persen = totalPasien > 0 ? parseFloat(((totalDropOut / totalPasien) * 100).toFixed(2)) : 0;
    return {
      total,
      total_pasien: totalPasien,
      total_drop_out: totalDropOut,
      numerator: totalDropOut,
      denominator: totalPasien,
      persen,
      standar: '≤ 50%',
      category: 'Rehabilitasi Medis'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const jp = d.jumlah_pasien || 0;
    const jdo = d.jumlah_drop_out || 0;
    return {
      ...d,
      hasil: jp > 0 ? parseFloat(((jdo / jp) * 100).toFixed(2)) : 0
    };
  });
  return result;
};

module.exports = baseService;
