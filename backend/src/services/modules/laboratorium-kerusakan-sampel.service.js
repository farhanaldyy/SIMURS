const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumKerusakanSampel', {
  beforeCreate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.jumlah_kerusakan !== undefined) data.jumlah_kerusakan = parseInt(data.jumlah_kerusakan) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.jumlah_kerusakan !== undefined) data.jumlah_kerusakan = parseInt(data.jumlah_kerusakan) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.jumlah_pasien || 0), 0);
    const totalKerusakan = data.reduce((sum, d) => sum + (d.jumlah_kerusakan || 0), 0);
    
    // Percentage of NO damage: (Total Pasien - Total Kerusakan) / Total Pasien * 100
    const presentase = totalPasien > 0 ? parseFloat((((totalPasien - totalKerusakan) / totalPasien) * 100).toFixed(2)) : 100;

    return {
      total,
      total_pasien: totalPasien,
      total_kerusakan: totalKerusakan,
      presentase,
      standar: '100%',
      category: 'Laboratorium'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const jp = d.jumlah_pasien || 0;
    const jk = d.jumlah_kerusakan || 0;
    const presentase = jp > 0 ? parseFloat((((jp - jk) / jp) * 100).toFixed(2)) : 100;
    return {
      ...d,
      presentase: presentase
    };
  });
  return result;
};

module.exports = baseService;
