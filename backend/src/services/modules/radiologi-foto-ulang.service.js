const { createGenericService } = require('./generic.service');

const baseService = createGenericService('radiologiFotoUlang', {
  beforeCreate(data) {
    if (data.over_exposure !== undefined) data.over_exposure = parseInt(data.over_exposure) || 0;
    if (data.under_exposure !== undefined) data.under_exposure = parseInt(data.under_exposure) || 0;
    if (data.positioning !== undefined) data.positioning = parseInt(data.positioning) || 0;
    if (data.artefac !== undefined) data.artefac = parseInt(data.artefac) || 0;
    if (data.equitmen !== undefined) data.equitmen = parseInt(data.equitmen) || 0;
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.over_exposure !== undefined) data.over_exposure = parseInt(data.over_exposure) || 0;
    if (data.under_exposure !== undefined) data.under_exposure = parseInt(data.under_exposure) || 0;
    if (data.positioning !== undefined) data.positioning = parseInt(data.positioning) || 0;
    if (data.artefac !== undefined) data.artefac = parseInt(data.artefac) || 0;
    if (data.equitmen !== undefined) data.equitmen = parseInt(data.equitmen) || 0;
    if (data.jumlah_pemeriksaan !== undefined) data.jumlah_pemeriksaan = parseInt(data.jumlah_pemeriksaan) || 0;
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalOver = data.reduce((sum, d) => sum + (d.over_exposure || 0), 0);
    const totalUnder = data.reduce((sum, d) => sum + (d.under_exposure || 0), 0);
    const totalPos = data.reduce((sum, d) => sum + (d.positioning || 0), 0);
    const totalArt = data.reduce((sum, d) => sum + (d.artefac || 0), 0);
    const totalEquit = data.reduce((sum, d) => sum + (d.equitmen || 0), 0);
    const totalPemeriksaan = data.reduce((sum, d) => sum + (d.jumlah_pemeriksaan || 0), 0);
    const totalKejadian = totalOver + totalUnder + totalPos + totalArt + totalEquit;

    const persen = totalPemeriksaan > 0 ? parseFloat(((totalKejadian / totalPemeriksaan) * 100).toFixed(2)) : 0;

    return {
      total,
      total_over_exposure: totalOver,
      total_under_exposure: totalUnder,
      total_positioning: totalPos,
      total_artefac: totalArt,
      total_equitmen: totalEquit,
      total_pemeriksaan: totalPemeriksaan,
      total_kejadian: totalKejadian,
      persen,
      standar: '0%',
      category: 'Radiologi'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const over = d.over_exposure || 0;
    const under = d.under_exposure || 0;
    const pos = d.positioning || 0;
    const art = d.artefac || 0;
    const equit = d.equitmen || 0;
    const jp = d.jumlah_pemeriksaan || 0;
    const totalKejadian = over + under + pos + art + equit;
    return {
      ...d,
      hasil: jp > 0 ? parseFloat(((totalKejadian / jp) * 100).toFixed(2)) : 0
    };
  });
  return result;
};

module.exports = baseService;
