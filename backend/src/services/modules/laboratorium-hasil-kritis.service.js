const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumHasilKritis', {
  beforeCreate(data) {
    if (data.nilai_kritis !== undefined) data.nilai_kritis = parseInt(data.nilai_kritis) || 0;
    if (data.lt_30 !== undefined) data.lt_30 = parseInt(data.lt_30) || 0;
    if (data.gt_30 !== undefined) data.gt_30 = parseInt(data.gt_30) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.nilai_kritis !== undefined) data.nilai_kritis = parseInt(data.nilai_kritis) || 0;
    if (data.lt_30 !== undefined) data.lt_30 = parseInt(data.lt_30) || 0;
    if (data.gt_30 !== undefined) data.gt_30 = parseInt(data.gt_30) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalNilaiKritis = data.reduce((sum, d) => sum + (d.nilai_kritis || 0), 0);
    const totalLt30 = data.reduce((sum, d) => sum + (d.lt_30 || 0), 0);
    const totalGt30 = data.reduce((sum, d) => sum + (d.gt_30 || 0), 0);
    
    const presentase = totalNilaiKritis > 0 ? parseFloat(((totalLt30 / totalNilaiKritis) * 100).toFixed(2)) : 0;

    return {
      total,
      total_nilai_kritis: totalNilaiKritis,
      total_lt_30: totalLt30,
      total_gt_30: totalGt30,
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
    const nk = d.nilai_kritis || 0;
    const lt = d.lt_30 || 0;
    const presentase = nk > 0 ? parseFloat(((lt / nk) * 100).toFixed(2)) : 0;
    return {
      ...d,
      presentase: presentase
    };
  });
  return result;
};

module.exports = baseService;
