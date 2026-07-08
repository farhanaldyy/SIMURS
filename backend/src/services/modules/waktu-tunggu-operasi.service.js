const { createGenericService } = require('./generic.service');

function getDaysDiff(d1, d2) {
  if (!d1 || !d2) return 0;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  date1.setUTCHours(0, 0, 0, 0);
  date2.setUTCHours(0, 0, 0, 0);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

const service = createGenericService('waktuTungguOperasi', {
  beforeCreate(data) {
    data.waktu_tunggu = getDaysDiff(data.tanggal_penjadwalan, data.tanggal_operasi);
    return data;
  },
  beforeUpdate(data) {
    if (data.tanggal_penjadwalan && data.tanggal_operasi) {
      data.waktu_tunggu = getDaysDiff(data.tanggal_penjadwalan, data.tanggal_operasi);
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalWaktuTunggu = data.reduce((sum, item) => sum + item.waktu_tunggu, 0);
    const rataRata = total > 0 ? parseFloat((totalWaktuTunggu / total).toFixed(2)) : 0;

    return {
      total,
      totalWaktuTunggu,
      rataRata,
      standar: '-'
    };
  }
});

module.exports = service;
