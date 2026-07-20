const { createGenericService } = require('./generic.service');

function hitungSelisihMenit(jam1, jam2) {
  if (!jam1 || !jam2) return 0;
  const j1 = typeof jam1 === 'string' ? jam1 : jam1.toTimeString().split(' ')[0];
  const j2 = typeof jam2 === 'string' ? jam2 : jam2.toTimeString().split(' ')[0];

  const d1 = new Date(`2000-01-01T${j1}`);
  const d2 = new Date(`2000-01-01T${j2}`);
  let diff = Math.round((d2 - d1) / 60000);
  if (diff < 0) diff += 1440;
  return diff;
}

const service = createGenericService('simrsResponseTimeIt', {
  beforeCreate(data) {
    if (data.jam_laporan && data.jam_tindakan) {
      data.response_time_menit = hitungSelisihMenit(data.jam_laporan, data.jam_tindakan);
    }
    return data;
  },

  beforeUpdate(data) {
    if (data.jam_laporan && data.jam_tindakan) {
      data.response_time_menit = hitungSelisihMenit(data.jam_laporan, data.jam_tindakan);
    }
    return data;
  },

  calculateSummary(data) {
    const totalData = data.length;
    const totalResponseTimeMenit = data.reduce((acc, curr) => acc + (parseInt(curr.response_time_menit) || 0), 0);
    
    // Total Jam = total response time / 60 (menit)
    const totalJam = parseFloat((totalResponseTimeMenit / 60).toFixed(2));
    
    // Hasil Response Time = total jam / total data
    const hasilResponseTime = totalData > 0 ? parseFloat((totalJam / totalData).toFixed(4)) : 0;
    
    // Presentase = Hasil Response Time / 60 (%)
    const presentase = parseFloat(((hasilResponseTime / 60) * 100).toFixed(2));

    // Rata-rata response time (menit)
    const rataRataMenit = totalData > 0 ? parseFloat((totalResponseTimeMenit / totalData).toFixed(2)) : 0;

    return {
      total: totalData,
      totalJam,
      hasilResponseTime,
      presentase,
      rataRataMenit,
      rataRata: `${rataRataMenit} Menit`,
      persen: presentase,
      standar: '≤ 15 Menit',
      category: 'SIMRS'
    };
  }
});

module.exports = service;
