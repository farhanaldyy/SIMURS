const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const baseService = createGenericService('waktuTungguPoliklinik', {
  beforeCreate(data) {
    if (data.waktu_tunggu !== undefined) {
      data.waktu_tunggu = parseFloat(data.waktu_tunggu);
    }
    return data;
  },
  beforeUpdate(data) {
    if (data.waktu_tunggu !== undefined) {
      data.waktu_tunggu = parseFloat(data.waktu_tunggu);
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const totalPasien = data.reduce((sum, item) => sum + item.jumlah_pasien, 0);
    const totalWaktuTunggu = data.reduce((sum, item) => sum + item.waktu_tunggu, 0);
    const rataRata = total > 0 ? parseFloat((totalWaktuTunggu / total).toFixed(2)) : 0;
    
    return {
      total,
      totalPasien,
      totalWaktuTunggu: parseFloat(totalWaktuTunggu.toFixed(2)),
      rataRata,
      standar: '≤ 60 menit'
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
