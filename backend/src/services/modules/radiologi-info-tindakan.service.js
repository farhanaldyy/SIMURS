const { createGenericService } = require('./generic.service');

const baseService = createGenericService('radiologiInfoTindakan', {
  beforeCreate(data) {
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    if (data.kepatuhan_pengisian !== undefined) data.kepatuhan_pengisian = parseInt(data.kepatuhan_pengisian) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    if (data.kepatuhan_pengisian !== undefined) data.kepatuhan_pengisian = parseInt(data.kepatuhan_pengisian) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPemeriksaan = data.reduce((sum, d) => sum + (d.jumlah_pemeriksaan || 0), 0);
    const totalKepatuhan = data.reduce((sum, d) => sum + (d.kepatuhan_pengisian || 0), 0);

    const persen = totalPemeriksaan > 0 ? parseFloat(((totalKepatuhan / totalPemeriksaan) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator: totalKepatuhan,
      denominator: totalPemeriksaan,
      persen,
      standar: '≥ 85%',
      category: 'Radiologi'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const jp = d.jumlah_pemeriksaan || 0;
    const kp = d.kepatuhan_pengisian || 0;
    return {
      ...d,
      hasil: jp > 0 ? parseFloat(((kp / jp) * 100).toFixed(2)) : 0
    };
  });
  return result;
};

module.exports = baseService;
