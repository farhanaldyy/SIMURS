const { createGenericService } = require('./generic.service');

function hitungSelisihMenit(jam1, jam2) {
  // jam1 and jam2 are Date objects from Prisma (representing time)
  // or strings from client
  const j1 = typeof jam1 === 'string' ? jam1 : jam1.toTimeString().split(' ')[0];
  const j2 = typeof jam2 === 'string' ? jam2 : jam2.toTimeString().split(' ')[0];

  const d1 = new Date(`2000-01-01T${j1}`);
  const d2 = new Date(`2000-01-01T${j2}`);
  let diff = (d2 - d1) / 60000;
  if (diff < 0) diff += 1440;
  return diff;
}

const service = createGenericService('emergencyResponseTime', {
  beforeCreate(data) {
    data.respon_time_menit = hitungSelisihMenit(data.jam_datang, data.jam_dilayani_dokter);
    return data;
  },
  beforeUpdate(data) {
    if (data.jam_datang && data.jam_dilayani_dokter) {
      data.respon_time_menit = hitungSelisihMenit(data.jam_datang, data.jam_dilayani_dokter);
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalMenit = data.reduce((acc, curr) => acc + parseFloat(curr.respon_time_menit), 0);
    const avg = total > 0 ? (totalMenit / total).toFixed(2) : 0;
    const patuh = data.filter(d => parseFloat(d.respon_time_menit) <= 5).length;
    return {
      total,
      numerator: patuh,
      rataRata: avg,
      persen: avg <= 5 && total > 0 ? 100 : 0, // for badge/metric
      standar: '≤ 5 menit'
    };
  }
});

module.exports = service;
