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
    const queryWhere = { tipe: 'kepatuhan_fornas' };
    if (where.periode_id) queryWhere.periode_id = parseInt(where.periode_id);

    const data = await prisma.mutuFarmasi.findMany({
      where: queryWhere,
      orderBy: { id: 'asc' }
    });

    return { data, total: data.length };
  },

  async getOne(id) {
    return prisma.mutuFarmasi.findFirst({
      where: { id: parseInt(id), tipe: 'kepatuhan_fornas' }
    });
  },

  async getSummary(periode_id) {
    let pId = typeof periode_id === 'object' && periode_id !== null ? periode_id.periode_id : periode_id;
    pId = parseInt(pId);
    if (isNaN(pId)) {
      return { total: 0, numerator: 0, denominator: 0, persen: 100, standar: '100%' };
    }
    const record = await prisma.mutuFarmasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe: 'kepatuhan_fornas'
        }
      }
    });

    const val1 = record ? record.val1 : 0;
    const val2 = record ? record.val2 : 0;
    const persen = calculatePercentage(val2, val1);

    return {
      total: val1,
      numerator: val2,
      denominator: val1,
      persen,
      standar: '100%'
    };
  },

  async upsert(body, userId) {
    const { id, periode_id, val1, val2 } = body;
    const pId = parseInt(periode_id);
    const v1 = parseInt(val1 || 0);
    const v2 = parseInt(val2 || 0);

    const oldRecord = await prisma.mutuFarmasi.findUnique({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe: 'kepatuhan_fornas'
        }
      }
    });

    const record = await prisma.mutuFarmasi.upsert({
      where: {
        periode_id_tipe: {
          periode_id: pId,
          tipe: 'kepatuhan_fornas'
        }
      },
      update: {
        val1: v1,
        val2: v2
      },
      create: {
        periode_id: pId,
        tipe: 'kepatuhan_fornas',
        val1: v1,
        val2: v2,
        created_by: userId
      }
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasi',
          record_id: record.id,
          aksi: oldRecord ? 'update' : 'create',
          data_lama: oldRecord ? JSON.parse(JSON.stringify(oldRecord)) : null,
          data_baru: JSON.parse(JSON.stringify(record))
        }
      }).catch(err => console.error(err));
    }

    return record;
  },

  async delete(id, userId) {
    const oldRecord = await prisma.mutuFarmasi.findFirst({
      where: { id: parseInt(id), tipe: 'kepatuhan_fornas' }
    });
    if (!oldRecord) return null;

    const record = await prisma.mutuFarmasi.delete({
      where: { id: oldRecord.id }
    });

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
      }).catch(err => console.error(err));
    }

    return record;
  },

  // Exceptions list CRUD
  async getAllObatDiluarFornas(periodeId) {
    return prisma.mutuFarmasiObatDiluarFornas.findMany({
      where: { periode_id: parseInt(periodeId) },
      orderBy: { id: 'asc' }
    });
  },

  async upsertObatDiluarFornas(body, userId) {
    const { id, periode_id, nama_dokter, obat } = body;
    const data = {
      periode_id: parseInt(periode_id),
      nama_dokter: nama_dokter,
      obat: Array.isArray(obat) ? JSON.stringify(obat) : obat,
    };

    let record;
    let oldRecord = null;

    if (id) {
      oldRecord = await prisma.mutuFarmasiObatDiluarFornas.findUnique({ where: { id: parseInt(id) } });
      record = await prisma.mutuFarmasiObatDiluarFornas.update({
        where: { id: parseInt(id) },
        data
      });
    } else {
      record = await prisma.mutuFarmasiObatDiluarFornas.create({
        data: { ...data, created_by: userId }
      });
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasiObatDiluarFornas',
          record_id: record.id,
          aksi: oldRecord ? 'update' : 'create',
          data_lama: oldRecord ? JSON.parse(JSON.stringify(oldRecord)) : null,
          data_baru: JSON.parse(JSON.stringify(record))
        }
      }).catch(err => console.error(err));
    }

    return record;
  },

  async deleteObatDiluarFornas(id, userId) {
    const oldRecord = await prisma.mutuFarmasiObatDiluarFornas.findUnique({ where: { id: parseInt(id) } });
    if (!oldRecord) return null;

    const record = await prisma.mutuFarmasiObatDiluarFornas.delete({ where: { id: parseInt(id) } });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasiObatDiluarFornas',
          record_id: record.id,
          aksi: 'delete',
          data_lama: JSON.parse(JSON.stringify(oldRecord)),
          data_baru: null
        }
      }).catch(err => console.error(err));
    }

    return record;
  }
};

module.exports = service;
