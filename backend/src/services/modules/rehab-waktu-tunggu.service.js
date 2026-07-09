const { createGenericService } = require('./generic.service');

const service = createGenericService('rehabWaktuTunggu', {
  beforeCreate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const lt60 = parseInt(data.waktu_tunggu_lt_60) || 0;
    const totalWaktu = parseInt(data.total_waktu_tunggu) || 0;
    data.rata_rata_waktu_tunggu = jp > 0 ? parseFloat((totalWaktu / jp).toFixed(2)) : 0;
    data.hasil = jp > 0 ? parseFloat((lt60 / jp * 100).toFixed(2)) : 100;
    return data;
  },
  beforeUpdate(data) {
    const jp = parseInt(data.jumlah_pasien) || 0;
    const lt60 = parseInt(data.waktu_tunggu_lt_60) || 0;
    const totalWaktu = parseInt(data.total_waktu_tunggu) || 0;
    data.rata_rata_waktu_tunggu = jp > 0 ? parseFloat((totalWaktu / jp).toFixed(2)) : 0;
    data.hasil = jp > 0 ? parseFloat((lt60 / jp * 100).toFixed(2)) : 100;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    let totalPasien = 0;
    let totalLt60 = 0;
    let totalWaktu = 0;
    data.forEach(d => {
      totalPasien += d.jumlah_pasien || 0;
      totalLt60 += d.waktu_tunggu_lt_60 || 0;
      totalWaktu += d.total_waktu_tunggu || 0;
    });
    const rataRataWaktuTunggu = totalPasien > 0 ? parseFloat((totalWaktu / totalPasien).toFixed(2)) : 0;
    const persen = totalPasien > 0 ? parseFloat((totalLt60 / totalPasien * 100).toFixed(2)) : 100;
    return {
      total,
      total_pasien: totalPasien,
      total_waktu_tunggu_lt_60: totalLt60,
      total_waktu_tunggu: totalWaktu,
      rata_rata_waktu_tunggu: rataRataWaktuTunggu,
      rataRata: rataRataWaktuTunggu,
      persen,
      standar: '≤ 60 menit',
      category: 'Rehabilitasi Medis'
    };
  }
});

module.exports = service;
