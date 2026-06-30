const { createGenericService } = require('./generic.service');

function hitungSelisihMenit(jam1, jam2) {
  const j1 = typeof jam1 === 'string' ? jam1 : jam1.toTimeString().split(' ')[0];
  const j2 = typeof jam2 === 'string' ? jam2 : jam2.toTimeString().split(' ')[0];

  const d1 = new Date(`2000-01-01T${j1}`);
  const d2 = new Date(`2000-01-01T${j2}`);
  let diff = (d2 - d1) / 60000;
  if (diff < 0) diff += 1440;
  return diff;
}

const service = createGenericService('pasienTertahanIgd', {
  beforeCreate(data) {
    data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jam_masuk, data.jam_pindah_ruangan));
    return data;
  },
  beforeUpdate(data) {
    if (data.jam_masuk && data.jam_pindah_ruangan) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jam_masuk, data.jam_pindah_ruangan));
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalMenit = data.reduce((acc, curr) => acc + curr.waktu_tunggu_menit, 0);
    const avg = total > 0 ? (totalMenit / total).toFixed(2) : 0;
    return {
      total,
      rataRata: avg,
      persen: avg <= 240 && total > 0 ? 100 : 0,
      standar: '≤ 240 menit'
    };
  }
});

module.exports = service;
