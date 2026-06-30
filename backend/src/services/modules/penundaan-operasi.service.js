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
    if (data.batal === true || data.batal === 'true') {
      data.waktu_tunggu_menit = 0;
    } else {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    }
    return data;
  },
  beforeUpdate(data) {
    if (data.batal === true || data.batal === 'true') {
      data.waktu_tunggu_menit = 0;
    } else if (data.jadwal_jam_operasi && data.jam_mulai_operasi) {
      data.waktu_tunggu_menit = Math.round(hitungSelisihMenit(data.jadwal_jam_operasi, data.jam_mulai_operasi));
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    // Delay or cancellation is counted as a delay if:
    // (wait time > 60 minutes OR batal is true) AND indikasi_medis is false
    const delayed = data.filter(d => {
      const isOverOneHour = d.waktu_tunggu_menit > 60;
      const isBatal = d.batal === true;
      const hasIndikasiMedis = d.indikasi_medis === true;
      return (isOverOneHour || isBatal) && !hasIndikasiMedis;
    }).length;

    const persen = total > 0 ? ((delayed / total) * 100).toFixed(2) : 0;
    return {
      total,
      numerator: delayed,
      persen,
      standar: '< 5%'
    };
  }
});

module.exports = service;
