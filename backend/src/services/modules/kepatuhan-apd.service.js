const { createGenericService } = require('./generic.service');

const service = createGenericService('kepatuhanApd', {
  calculateSummary(data) {
    const total = data.length;
    let totalYa = 0;
    let totalTidak = 0;

    data.forEach(d => {
      const items = [
        d.penutup_kepala,
        d.face_shield,
        d.masker,
        d.apron,
        d.coverall,
        d.sarung_tangan,
        d.cover_shoes
      ];
      const ya = items.filter(Boolean).length;
      totalYa += ya;
      totalTidak += (7 - ya);
    });

    const persen = totalTidak > 0 ? parseFloat(((totalYa / totalTidak) * 100).toFixed(2)) : (totalYa > 0 ? 100 : 0);

    return {
      total,
      numerator: totalYa,
      denominator: totalTidak,
      persen,
      standar: '100%'
    };
  }
});

module.exports = service;
