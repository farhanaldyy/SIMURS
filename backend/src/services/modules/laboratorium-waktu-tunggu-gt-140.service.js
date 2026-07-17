const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumWaktuTungguGt140', {
  beforeCreate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.prx_gt_140 !== undefined) data.prx_gt_140 = parseInt(data.prx_gt_140) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.prx_gt_140 !== undefined) data.prx_gt_140 = parseInt(data.prx_gt_140) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.jumlah_pasien || 0), 0);
    const totalPasienGt140 = data.reduce((sum, d) => sum + (d.prx_gt_140 || 0), 0);
    const totalPasienLt140 = totalPasien - totalPasienGt140;
    
    const presentase = totalPasien > 0 ? parseFloat(((totalPasienLt140 / totalPasien) * 100).toFixed(2)) : 0;
    const sisaPresentase = totalPasien > 0 ? parseFloat((100 - presentase).toFixed(2)) : 0;

    return {
      total,
      total_pasien: totalPasien,
      total_pasien_gt_140: totalPasienGt140,
      total_pasien_lt_140: totalPasienLt140,
      presentase,
      sisa_presentase: sisaPresentase,
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
    const gt = d.prx_gt_140 || 0;
    const lt = jp - gt;
    const presentase = jp > 0 ? parseFloat(((lt / jp) * 100).toFixed(2)) : 0;
    return {
      ...d,
      pasien_lt_140: lt,
      presentase: presentase
    };
  });
  return result;
};

module.exports = baseService;
