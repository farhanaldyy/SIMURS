const prisma = require('../../config/database');

const service = {
  ignoreUnitId: true,

  async getAll(where) {
    const queryWhere = {};
    if (where.periode_id) queryWhere.periode_id = parseInt(where.periode_id);

    const data = await prisma.mutuFarmasiKesalahanObat.findMany({
      where: queryWhere,
      orderBy: { tanggal: 'asc' }
    });

    return { data, total: data.length };
  },

  async getOne(id) {
    return prisma.mutuFarmasiKesalahanObat.findUnique({
      where: { id: parseInt(id) }
    });
  },

  async getSummary(periode_id) {
    let pId = typeof periode_id === 'object' && periode_id !== null ? periode_id.periode_id : periode_id;
    pId = parseInt(pId);
    if (isNaN(pId)) {
      return { 
        total: 0, 
        numerator: 0, 
        denominator: 0, 
        persen: 0, 
        standar: '0%',
        salah_rajal: 0,
        salah_ranap: 0,
        salah_igd: 0,
        resep_rajal: 0,
        resep_ranap: 0,
        resep_igd: 0
      };
    }
    const records = await prisma.mutuFarmasiKesalahanObat.findMany({
      where: { periode_id: pId }
    });

    let resepRajal = 0, resepRanap = 0, resepIgd = 0;
    let salahRajal = 0, salahRanap = 0, salahIgd = 0;

    records.forEach(r => {
      resepRajal += (r.resep_rajal || 0);
      resepRanap += (r.resep_ranap || 0);
      resepIgd += (r.resep_igd || 0);

      salahRajal += (r.salah_rajal || 0);
      salahRanap += (r.salah_ranap || 0);
      salahIgd += (r.salah_igd || 0);
    });

    const totalResep = resepRajal + resepRanap + resepIgd;
    const totalSalah = salahRajal + salahRanap + salahIgd;

    const persenKesalahan = totalResep > 0 ? parseFloat(((totalSalah / totalResep) * 100).toFixed(2)) : 0;

    return {
      total: records.length,
      numerator: totalSalah,
      denominator: totalResep,
      persen: persenKesalahan,
      persenKesalahan,
      standar: '0%',
      salah_rajal: salahRajal,
      salah_ranap: salahRanap,
      salah_igd: salahIgd,
      resep_rajal: resepRajal,
      resep_ranap: resepRanap,
      resep_igd: resepIgd
    };
  },

  async upsert(body, userId) {
    const { id, periode_id, tanggal, resep_rajal, resep_ranap, resep_igd, salah_rajal, salah_ranap, salah_igd } = body;
    const data = {
      periode_id: parseInt(periode_id),
      tanggal: new Date(tanggal),
      resep_rajal: parseInt(resep_rajal || 0),
      resep_ranap: parseInt(resep_ranap || 0),
      resep_igd: parseInt(resep_igd || 0),
      salah_rajal: parseInt(salah_rajal || 0),
      salah_ranap: parseInt(salah_ranap || 0),
      salah_igd: parseInt(salah_igd || 0)
    };

    let record;
    let oldRecord = null;

    if (id) {
      oldRecord = await prisma.mutuFarmasiKesalahanObat.findUnique({ where: { id: parseInt(id) } });
      record = await prisma.mutuFarmasiKesalahanObat.update({
        where: { id: parseInt(id) },
        data
      });
    } else {
      record = await prisma.mutuFarmasiKesalahanObat.create({
        data: { ...data, created_by: userId }
      });
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasiKesalahanObat',
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
    const oldRecord = await prisma.mutuFarmasiKesalahanObat.findUnique({ where: { id: parseInt(id) } });
    if (!oldRecord) return null;

    const record = await prisma.mutuFarmasiKesalahanObat.delete({ where: { id: parseInt(id) } });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          tabel: 'mutuFarmasiKesalahanObat',
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
