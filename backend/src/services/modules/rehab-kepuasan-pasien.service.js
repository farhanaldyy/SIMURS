const { createGenericService } = require('./generic.service');

const service = createGenericService('rehabKepuasanPasien', {
  beforeCreate(data) {
    const maxVal = parseInt(data.nilai_maksimal) || 0;
    const scoreVal = parseInt(data.hasil_kuisioner) || 0;
    data.total = maxVal > 0 ? parseFloat((scoreVal / maxVal * 100).toFixed(2)) : 0;
    return data;
  },
  beforeUpdate(data) {
    const maxVal = parseInt(data.nilai_maksimal) || 0;
    const scoreVal = parseInt(data.hasil_kuisioner) || 0;
    data.total = maxVal > 0 ? parseFloat((scoreVal / maxVal * 100).toFixed(2)) : 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalMax = 0;
    let totalScore = 0;
    data.forEach(d => {
      totalMax += d.nilai_maksimal || 0;
      totalScore += d.hasil_kuisioner || 0;
    });
    const persen = totalMax > 0 ? parseFloat((totalScore / totalMax * 100).toFixed(2)) : 0;
    return {
      total,
      total_nilai_maksimal: totalMax,
      total_hasil_kuisioner: totalScore,
      numerator: totalScore,
      denominator: totalMax,
      persen,
      standar: '≥ 75%',
      category: 'Rehabilitasi Medis'
    };
  }
});

module.exports = service;
