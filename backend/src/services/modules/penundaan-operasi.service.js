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

const service = createGenericService('penundaanOperasi', {
  ignoreUnitId: true,
  beforeCreate(data) {
    data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    return data;
  },
  beforeUpdate(data) {
    if (data.jadwal_jam_operasi && data.jam_mulai_operasi) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    // Delay is defined as wait time > 30 minutes
    const delayed = data.filter(d => d.waktu_tunggu_menit > 30).length;
    const persen = total > 0 ? ((delayed / total) * 100).toFixed(2) : 0;
    return {
      total,
      numerator: delayed,
      persen,
      standar: '≤ 5%'
    };
  }
});

module.exports = service;
