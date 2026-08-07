const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('kepuasanPasienPelayanan', {
  async beforeCreate(data) {
    const pid = parseInt(data.periode_id);
    const uid = parseInt(data.unit_id);
    
    if (pid && uid) {
      const existing = await prisma.kepuasanPasienPelayanan.findFirst({
        where: { periode_id: pid, unit_id: uid }
      });
      if (existing) {
        const error = new Error('Data Kepuasan Pasien pada unit dan periode ini sudah pernah diinput (hanya 1x input per periode). Silakan perbarui data yang ada.');
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.total_pasien !== undefined) data.total_pasien = parseInt(data.total_pasien) || 0;
    if (data.rata_rata_penilaian !== undefined) data.rata_rata_penilaian = parseFloat(parseFloat(data.rata_rata_penilaian).toFixed(2)) || 0;
    data.persentase = data.rata_rata_penilaian || 0;
    return data;
  },

  beforeUpdate(data) {
    if (data.total_pasien !== undefined) data.total_pasien = parseInt(data.total_pasien) || 0;
    if (data.rata_rata_penilaian !== undefined) data.rata_rata_penilaian = parseFloat(parseFloat(data.rata_rata_penilaian).toFixed(2)) || 0;
    data.persentase = data.rata_rata_penilaian || 0;
    return data;
  },

  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.total_pasien || 0), 0);
    
    let sumPenilaian = 0;
    data.forEach(d => {
      sumPenilaian += (d.rata_rata_penilaian || 0);
    });
    const avgPenilaian = total > 0 ? parseFloat((sumPenilaian / total).toFixed(2)) : 0;
    const persen = avgPenilaian;

    return {
      total,
      totalPasien,
      avgPenilaian,
      numerator: avgPenilaian,
      denominator: totalPasien,
      persen,
      standar: '≥ 76,61%',
      category: 'Mutu Pelayanan'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => ({
    ...d,
    hasil: `${d.rata_rata_penilaian || 0}%`
  }));
  return result;
};

module.exports = baseService;
