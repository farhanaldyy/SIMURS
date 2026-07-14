const { createGenericService } = require('./generic.service');

const baseService = createGenericService('laundryLinenHilang', {
  calculateSummary(data) {
    const total = data.length;
    let totalDiambil = 0;
    let totalDikembalikan = 0;
    
    data.forEach(d => {
      totalDiambil += d.jumlah_diambil || 0;
      totalDikembalikan += d.jumlah_dikembalikan || 0;
    });

    const persen = totalDiambil > 0 ? parseFloat(((totalDikembalikan / totalDiambil) * 100).toFixed(2)) : 100;
    
    return {
      total,
      numerator: totalDikembalikan,
      denominator: totalDiambil,
      persen,
      standar: '100%'
    };
  }
});

module.exports = baseService;
