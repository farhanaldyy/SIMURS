const { createGenericService } = require('./generic.service');

const service = createGenericService('visitDokter', {
  calculateSummary(data) {
    const total = data.length;
    const cepat = data.filter(d => d.kategori_visit === 'cepat').length;
    const tepat = data.filter(d => d.kategori_visit === 'tepat_waktu').length;
    const terlambat = data.filter(d => d.kategori_visit === 'terlambat').length;
    const tidakVisit = data.filter(d => d.kategori_visit === 'tidak_visit' || d.kategori_visit === 'sangat_terlambat').length;
    const persen1 = total > 0 ? ((cepat / total) * 100).toFixed(2) : "0";
    const persen2 = total > 0 ? ((tepat / total) * 100).toFixed(2) : "0";
    const persen = total > 0 ? (((cepat + tepat) / total) * 100).toFixed(2) : "0";
    return {
      total,
      numerator: cepat,
      numerator2: tepat,
      numerator3: terlambat,
      numerator4: tidakVisit,
      persen1,
      persen2,
      persen,
      standar: '≥ 80%'
    };
  }
});

module.exports = service;
