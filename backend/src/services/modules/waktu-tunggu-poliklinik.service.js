const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('waktuTungguPoliklinik', {
  async beforeCreate(data) {
    if (data.waktu_tunggu !== undefined) {
      data.waktu_tunggu = parseFloat(data.waktu_tunggu);
    }

    if (data.poli_id && data.periode_id) {
      const existing = await prisma.waktuTungguPoliklinik.findFirst({
        where: {
          poli_id: parseInt(data.poli_id),
          periode_id: parseInt(data.periode_id),
        },
        include: { poliklinik: true }
      });

      if (existing) {
        const poliNama = existing.poliklinik ? existing.poliklinik.nama : 'Poliklinik ini';
        throw Object.assign(
          new Error(`Data waktu tunggu untuk ${poliNama} pada periode terpilih sudah tersimpan. Silakan edit data yang sudah ada.`),
          { statusCode: 400 }
        );
      }
    }

    return data;
  },

  async beforeUpdate(data, id) {
    if (data.waktu_tunggu !== undefined) {
      data.waktu_tunggu = parseFloat(data.waktu_tunggu);
    }

    if (data.poli_id && data.periode_id) {
      const existing = await prisma.waktuTungguPoliklinik.findFirst({
        where: {
          poli_id: parseInt(data.poli_id),
          periode_id: parseInt(data.periode_id),
          NOT: { id: parseInt(id) }
        },
        include: { poliklinik: true }
      });

      if (existing) {
        const poliNama = existing.poliklinik ? existing.poliklinik.nama : 'Poliklinik ini';
        throw Object.assign(
          new Error(`Data waktu tunggu untuk ${poliNama} pada periode terpilih sudah tersimpan.`),
          { statusCode: 400 }
        );
      }
    }

    return data;
  },

  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, item) => sum + (item.jumlah_pasien || 0), 0);
    const totalWaktuTunggu = data.reduce((sum, item) => sum + (item.waktu_tunggu || 0), 0);
    const rataRata = total > 0 ? parseFloat((totalWaktuTunggu / total).toFixed(2)) : 0;
    const totalPatuh = data.filter(item => item.waktu_tunggu <= 60).length;
    const totalTidakPatuh = total - totalPatuh;
    const menitPerPasien = totalPasien > 0 ? parseFloat((totalWaktuTunggu / totalPasien).toFixed(2)) : 0;
    const wtInJam = parseFloat((totalWaktuTunggu / 60).toFixed(2));
    
    return {
      total,
      totalPasien,
      totalWaktuTunggu: parseFloat(totalWaktuTunggu.toFixed(2)),
      rataRata,
      totalPatuh,
      totalTidakPatuh,
      menitPerPasien,
      wtInJam,
      standar: 'Menit'
    };
  }
});

// Override getAll to include the poliklinik relation
const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.waktuTungguPoliklinik.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        poliklinik: true
      }
    }),
    prisma.waktuTungguPoliklinik.count({ where }),
  ]);
  return { data, total };
};

module.exports = baseService;
