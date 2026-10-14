const prisma = require('../../config/database');
const { createGenericService } = require('./generic.service');

function hitungKepatuhan(kategori, lamaJam) {
  const lama = parseFloat(lamaJam) || 0;
  const kat = String(kategori || '').toLowerCase();
  let batas = 168; // default Hijau: 7 hari
  if (kat.includes('merah')) batas = 24;
  else if (kat.includes('kuning')) batas = 72;
  return lama <= batas ? 1 : 0;
}

const baseService = createGenericService('waktuTanggapKomplain', {
  beforeCreate(data) {
    if (data.lama_tanggap_jam !== undefined) data.lama_tanggap_jam = parseFloat(data.lama_tanggap_jam) || 0;
    data.kepatuhan = hitungKepatuhan(data.kategori_komplain, data.lama_tanggap_jam);
    return data;
  },
  async beforeUpdate(data, id) {
    if (data.lama_tanggap_jam !== undefined) data.lama_tanggap_jam = parseFloat(data.lama_tanggap_jam) || 0;
    if (data.kategori_komplain !== undefined || data.lama_tanggap_jam !== undefined) {
      let kat = data.kategori_komplain;
      let lama = data.lama_tanggap_jam;
      if (kat === undefined || lama === undefined) {
        const existing = await prisma.waktuTanggapKomplain.findUnique({ where: { id: parseInt(id) } });
        if (existing) {
          if (kat === undefined) kat = existing.kategori_komplain;
          if (lama === undefined) lama = existing.lama_tanggap_jam;
        }
      }
      data.kepatuhan = hitungKepatuhan(kat, lama);
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const patuhCount = data.filter(d => d.kepatuhan === 1 || d.kepatuhan === true || d.kepatuhan === '1').length;
    const persen = total > 0 ? parseFloat(((patuhCount / total) * 100).toFixed(2)) : 0;

    return {
      total,
      numerator: patuhCount,
      denominator: total,
      persen,
      standar: '≥ 80%',
      category: 'Kepuasan Pasien'
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => ({
    ...d,
    status_tanggap: (d.kepatuhan === 1 || d.kepatuhan === true || d.kepatuhan === '1') ? 'Sesuai Standar' : 'Tidak Sesuai Standar'
  }));
  return result;
};

baseService.hitungKepatuhan = hitungKepatuhan;

module.exports = baseService;
