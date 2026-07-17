const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laboratoriumEkspertisiDokter', {
  beforeCreate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.ekspertisi_dokter !== undefined) data.ekspertisi_dokter = parseInt(data.ekspertisi_dokter) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.ekspertisi_dokter !== undefined) data.ekspertisi_dokter = parseInt(data.ekspertisi_dokter) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.jumlah_pasien || 0), 0);
    const totalEkspertisi = data.reduce((sum, d) => sum + (d.ekspertisi_dokter || 0), 0);
    
    // Percentage: Ekspertisi / Total Pasien * 100
    const presentase = totalPasien > 0 ? parseFloat(((totalEkspertisi / totalPasien) * 100).toFixed(2)) : 0;

    return {
      total,
      total_pasien: totalPasien,
      total_ekspertisi: totalEkspertisi,
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
    const je = d.ekspertisi_dokter || 0;
    const presentase = jp > 0 ? parseFloat(((je / jp) * 100).toFixed(2)) : 0;
    return {
      ...d,
      presentase: presentase
    };
  });
  return result;
};

module.exports = baseService;
