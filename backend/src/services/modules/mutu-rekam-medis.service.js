const prisma = require('../../config/database');

async function logAudit(userId, tabel, recordId, aksi, dataLama = null, dataBaru = null) {
  if (!userId) return;
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        tabel,
        record_id: recordId,
        aksi,
        data_lama: dataLama ? JSON.parse(JSON.stringify(dataLama)) : null,
        data_baru: dataBaru ? JSON.parse(JSON.stringify(dataBaru)) : null,
      }
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

const service = {
  ignoreUnitId: true,

  async getAll(where) {
    const queryWhere = {};
    if (where.periode_id) queryWhere.periode_id = parseInt(where.periode_id);
    
    const data = await prisma.mutuRekamMedis.findMany({
      where: queryWhere,
      orderBy: { periode_id: 'desc' }
    });

    return { data, total: data.length };
  },

  async getOne(id) {
    return prisma.mutuRekamMedis.findUnique({
      where: { id: parseInt(id) }
    });
  },

  async upsert(body, userId) {
    const {
      periode_id,
      kelengkapan_ranap_num,
      kelengkapan_ranap_den,
      pengembalian_num,
      pengembalian_den,
      antrian_online_num,
      antrian_online_den,
      coding_num,
      coding_den,
      mobile_jkn_num,
      mobile_jkn_den
    } = body;

    const pId = parseInt(periode_id);
    
    const kr_num = parseInt(kelengkapan_ranap_num || 0);
    const kr_den = parseInt(kelengkapan_ranap_den || 0);
    const kr_pct = kr_den > 0 ? parseFloat(((kr_num / kr_den) * 100).toFixed(2)) : 0;

    const pg_num = parseInt(pengembalian_num || 0);
    const pg_den = parseInt(pengembalian_den || 0);
    const pg_pct = pg_den > 0 ? parseFloat(((pg_num / pg_den) * 100).toFixed(2)) : 0;

    const ao_num = parseInt(antrian_online_num || 0);
    const ao_den = parseInt(antrian_online_den || 0);
    const ao_pct = ao_den > 0 ? parseFloat(((ao_num / ao_den) * 100).toFixed(2)) : 0;

    const cd_num = parseInt(coding_num || 0);
    const cd_den = parseInt(coding_den || 0);
    const cd_pct = cd_den > 0 ? parseFloat(((cd_num / cd_den) * 100).toFixed(2)) : 0;

    const mj_num = parseInt(mobile_jkn_num || 0);
    const mj_den = parseInt(mobile_jkn_den || 0);
    const mj_pct = mj_den > 0 ? parseFloat(((mj_num / mj_den) * 100).toFixed(2)) : 0;

    const oldRecord = await prisma.mutuRekamMedis.findUnique({
      where: { periode_id: pId }
    });

    const record = await prisma.mutuRekamMedis.upsert({
      where: { periode_id: pId },
      update: {
        kelengkapan_ranap_num: kr_num,
        kelengkapan_ranap_den: kr_den,
        kelengkapan_ranap_pct: kr_pct,
        pengembalian_num: pg_num,
        pengembalian_den: pg_den,
        pengembalian_pct: pg_pct,
        antrian_online_num: ao_num,
        antrian_online_den: ao_den,
        antrian_online_pct: ao_pct,
        coding_num: cd_num,
        coding_den: cd_den,
        coding_pct: cd_pct,
        mobile_jkn_num: mj_num,
        mobile_jkn_den: mj_den,
        mobile_jkn_pct: mj_pct
      },
      create: {
        periode_id: pId,
        kelengkapan_ranap_num: kr_num,
        kelengkapan_ranap_den: kr_den,
        kelengkapan_ranap_pct: kr_pct,
        pengembalian_num: pg_num,
        pengembalian_den: pg_den,
        pengembalian_pct: pg_pct,
        antrian_online_num: ao_num,
        antrian_online_den: ao_den,
        antrian_online_pct: ao_pct,
        coding_num: cd_num,
        coding_den: cd_den,
        coding_pct: cd_pct,
        mobile_jkn_num: mj_num,
        mobile_jkn_den: mj_den,
        mobile_jkn_pct: mj_pct,
        created_by: userId
      }
    });

    await logAudit(userId, 'mutu_rekam_medis', record.id, oldRecord ? 'update' : 'create', oldRecord, record);

    return record;
  },

  async delete(id, userId) {
    const oldRecord = await prisma.mutuRekamMedis.findUnique({
      where: { id: parseInt(id) }
    });
    if (!oldRecord) return null;

    const record = await prisma.mutuRekamMedis.delete({
      where: { id: parseInt(id) }
    });

    await logAudit(userId, 'mutu_rekam_medis', record.id, 'delete', oldRecord, null);

    return record;
  },

  async getSummary(where) {
    let tipe = where.tipe;
    if (!tipe && (where.indicator_id || where.id)) {
      const indId = where.indicator_id || where.id;
      if (indId === 'rm-dokumen') tipe = 'kelengkapan_ranap';
      else if (indId === 'rm-pengisian-dok') tipe = 'pengembalian_rm';
      else if (indId === 'rm-antrian-online') tipe = 'antrian_online';
      else if (indId === 'rm-coding-rwi-rwj') tipe = 'ketepatan_coding';
      else if (indId === 'rm-jkn') tipe = 'mobile_jkn';
    }

    if (!tipe) {
      return { total: 0, numerator: 0, denominator: 0, persen: 0, standar: '100%' };
    }

    let records = [];
    if (where.periode_id) {
      if (typeof where.periode_id === 'number' || typeof where.periode_id === 'string') {
        const rec = await prisma.mutuRekamMedis.findUnique({
          where: { periode_id: parseInt(where.periode_id) }
        });
        if (rec) records.push(rec);
      } else if (typeof where.periode_id === 'object') {
        records = await prisma.mutuRekamMedis.findMany({
          where: { periode_id: where.periode_id }
        });
      }
    } else {
      records = await prisma.mutuRekamMedis.findMany({});
    }

    let num = 0;
    let den = 0;
    let standar = '100%';

    if (tipe === 'antrian_online') {
      standar = '≥ 85%';
    } else if (tipe === 'mobile_jkn') {
      standar = '≥ 30%';
    } else if (tipe === 'pengembalian_rm') {
      standar = '1x24 Jam';
    }

    records.forEach(record => {
      if (tipe === 'kelengkapan_ranap') {
        num += record.kelengkapan_ranap_num || 0;
        den += record.kelengkapan_ranap_den || 0;
      } else if (tipe === 'pengembalian_rm') {
        num += record.pengembalian_num || 0;
        den += record.pengembalian_den || 0;
      } else if (tipe === 'antrian_online') {
        num += record.antrian_online_num || 0;
        den += record.antrian_online_den || 0;
      } else if (tipe === 'ketepatan_coding') {
        num += record.coding_num || 0;
        den += record.coding_den || 0;
      } else if (tipe === 'mobile_jkn') {
        num += record.mobile_jkn_num || 0;
        den += record.mobile_jkn_den || 0;
      }
    });

    const pct = den > 0 ? parseFloat(((num / den) * 100).toFixed(2)) : 0;

    return {
      total: den,
      numerator: num,
      denominator: den,
      persen: pct,
      standar,
      category: 'Rekam Medis'
    };
  }
};

module.exports = service;
