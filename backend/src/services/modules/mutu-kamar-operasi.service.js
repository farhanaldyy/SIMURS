const prisma = require('../../config/database');

function calculateResult(totalKejadian, totalOperasi) {
  const tk = parseInt(totalKejadian || 0);
  const to = parseInt(totalOperasi || 0);
  if (to === 0) {
    return tk === 0 ? 100 : 0;
  }
  const safeOps = to - tk;
  return parseFloat(((safeOps / to) * 100).toFixed(2));
}

const service = {
  ignoreUnitId: true,

  async getAll(where) {
    const queryWhere = {};
    if (where.periode_id) queryWhere.periode_id = parseInt(where.periode_id);
    if (where.tipe) queryWhere.tipe = where.tipe;
    
    const data = await prisma.mutuKamarOperasi.findMany({
      where: queryWhere,
      orderBy: { tipe: 'asc' }
    });

    return { data, total: data.length };
  },

  async getOne(id) {
    return prisma.mutuKamarOperasi.findUnique({
      where: { id: parseInt(id) }
    });
  },

  async upsert(body, userId) {
    const { periode_id, tipe, total_kejadian, total_operasi } = body;
    const pId = parseInt(periode_id);
    const tk = parseInt(total_kejadian || 0);
    const to = parseInt(total_operasi || 0);

    const oldRecord = await prisma.mutuKamarOperasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe
        }
      }
    });

    const record = await prisma.mutuKamarOperasi.upsert({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe
        }
      },
      update: {
        total_kejadian: tk,
        total_operasi: to
      },
      create: {
        periode_id: pId,
        tipe,
        total_kejadian: tk,
        total_operasi: to,
        created_by: userId
      }
    });

    // Audit Log
    if (userId) {
      const aksi = oldRecord ? 'update' : 'create';
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuKamarOperasi',
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
    const oldRecord = await prisma.mutuKamarOperasi.findUnique({
      where: { id: parseInt(id) }
    });
    if (!oldRecord) return null;

    const record = await prisma.mutuKamarOperasi.delete({
      where: { id: parseInt(id) }
    });

    // Audit Log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuKamarOperasi',
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
      return { total: 0, numerator: 0, denominator: 0, persen: 100, standar: '100%' };
    }

    const record = await prisma.mutuKamarOperasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: parseInt(periode_id),
          tipe
        }
      }
    });

    const totalKejadian = record ? record.total_kejadian : 0;
    const totalOperasi = record ? record.total_operasi : 0;
    const persen = calculateResult(totalKejadian, totalOperasi);

    return {
      total: totalKejadian,
      numerator: totalOperasi - totalKejadian,
      denominator: totalOperasi,
      persen,
      standar: '100%'
    };
  }
};

module.exports = {
  ...service,
  calculateResult
};
