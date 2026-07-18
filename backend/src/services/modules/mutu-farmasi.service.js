const prisma = require('../../config/database');

function calculatePercentage(num, den) {
  const d = parseInt(den || 0);
  const n = parseInt(num || 0);
  if (d === 0) return 0;
  return parseFloat(((n / d) * 100).toFixed(2));
}

const service = {
  ignoreUnitId: true,

  async getAll(where) {
    const queryWhere = {};
    if (where.periode_id) queryWhere.periode_id = parseInt(where.periode_id);
    if (where.tipe) queryWhere.tipe = where.tipe;
    
    const data = await prisma.mutuFarmasi.findMany({
      where: queryWhere,
      orderBy: { tipe: 'asc' }
    });

    return { data, total: data.length };
  },

  async getOne(id) {
    return prisma.mutuFarmasi.findUnique({
      where: { id: parseInt(id) }
    });
  },

  async upsert(body, userId) {
    const { periode_id, tipe, val1, val2, val3, val4 } = body;
    const pId = parseInt(periode_id);
    const v1 = parseInt(val1 || 0);
    const v2 = parseInt(val2 || 0);
    const v3 = parseInt(val3 || 0);
    const v4 = parseInt(val4 || 0);

    const oldRecord = await prisma.mutuFarmasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe
        }
      }
    });

    const record = await prisma.mutuFarmasi.upsert({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe
        }
      },
      update: {
        val1: v1,
        val2: v2,
        val3: v3,
        val4: v4
      },
      create: {
        periode_id: pId,
        tipe,
        val1: v1,
        val2: v2,
        val3: v3,
        val4: v4,
        created_by: userId
      }
    });

    // Audit Log
    if (userId) {
      const aksi = oldRecord ? 'update' : 'create';
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasi',
          record_id: record.id,
          aksi,
          data_lama: oldRecord ? JSON.parse(JSON.stringify(oldRecord)) : null,
          data_baru: JSON.parse(JSON.stringify(record))
        }
      }).catch(err => console.error('Audit log error:', err));
    }

    return record;
  },

  async delete(id, userId) {
    const oldRecord = await prisma.mutuFarmasi.findUnique({
      where: { id: parseInt(id) }
    });
    if (!oldRecord) return null;

    const record = await prisma.mutuFarmasi.delete({
      where: { id: parseInt(id) }
    });

    // Audit Log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasi',
          record_id: record.id,
          aksi: 'delete',
          data_lama: JSON.parse(JSON.stringify(oldRecord)),
          data_baru: null
        }
      }).catch(err => console.error('Audit log error:', err));
    }

    return record;
  },

  async getSummary(where) {
    const { periode_id, tipe } = where;
    if (!periode_id || !tipe) {
      return { total: 0, numerator: 0, denominator: 0, persen: 0, standar: '-' };
    }

    const record = await prisma.mutuFarmasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: parseInt(periode_id),
          tipe
        }
      }
    });

    const val1 = record ? record.val1 : 0;
    const val2 = record ? record.val2 : 0;
    const val3 = record ? record.val3 : 0;
    const val4 = record ? record.val4 : 0;

    if (tipe === 'double_check') {
      const persen = calculatePercentage(val2, val1);
      return {
        total: val1,
        numerator: val2,
        denominator: val1,
        persen,
        standar: '≥ 80%'
      };
    } else if (tipe === 'tidak_tersedia_rajal') {
      const persen = val1 > 0 ? parseFloat((val2 / val1).toFixed(4)) : 0;
      return {
        total: val1,
        numerator: val2,
        denominator: val1,
        persen,
        standar: '≤ 5%'
      };
    } else if (tipe === 'tidak_tersedia_ranap') {
      const persen = val1 > 0 ? parseFloat((val2 / val1).toFixed(4)) : 0;
      return {
        total: val1,
        numerator: val2,
        denominator: val1,
        persen,
        standar: '≤ 5%'
      };
    } else if (tipe === 'waktu_tunggu') {
      const totalObat = val1 + val3;
      const totalTunggu = val2 + val4;
      const persen = calculatePercentage(totalTunggu, totalObat);
      return {
        total: totalObat,
        numerator: totalTunggu,
        denominator: totalObat,
        persen,
        standar: '-' // no specific standard target
      };
    } else if (tipe === 'rata_waktu_tunggu') {
      return {
        total: record ? 1 : 0,
        numerator: 0,
        denominator: 0,
        persen: 0,
        rataRata: record ? `Racikan: ${val1} Menit, Non-Racikan: ${val2} Menit` : undefined,
        standar: 'Racikan < 60m, Non-Racikan < 30m'
      };
    }

    return { total: 0, numerator: 0, denominator: 0, persen: 0, standar: '-' };
  }
};

module.exports = {
  ...service,
  calculatePercentage
};
