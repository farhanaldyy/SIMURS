const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumKepatuhanIdentifikasi', {
  beforeCreate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.jumlah_kepatuhan !== undefined) data.jumlah_kepatuhan = parseInt(data.jumlah_kepatuhan) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.jumlah_kepatuhan !== undefined) data.jumlah_kepatuhan = parseInt(data.jumlah_kepatuhan) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.jumlah_pasien || 0), 0);
    const totalKepatuhan = data.reduce((sum, d) => sum + (d.jumlah_kepatuhan || 0), 0);
    
    // Percentage of compliance: Total Kepatuhan / Total Pasien * 100
    const presentase = totalPasien > 0 ? parseFloat(((totalKepatuhan / totalPasien) * 100).toFixed(2)) : 100;

    return {
      total,
      total_pasien: totalPasien,
      total_kepatuhan: totalKepatuhan,
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
    const jk = d.jumlah_kepatuhan || 0;
    const presentase = jp > 0 ? parseFloat(((jk / jp) * 100).toFixed(2)) : 100;
    return {
      ...d,
      presentase: presentase
    };
  });
  return result;
};

module.exports = baseService;
