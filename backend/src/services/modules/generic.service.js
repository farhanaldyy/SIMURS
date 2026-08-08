const prisma = require('../../config/database');
const { isPeriodClosed } = require('../../middleware/periodLock');

function coerceTypes(data) {
  for (const key in data) {
    const val = data[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      let finalVal = trimmed;

      // Do NOT convert spaces to underscores for free-text fields
      const isFreeText = key.includes('deskripsi') || key.includes('catatan') || key.includes('keterangan') || key.includes('detail') || key === 'nama_pasien' || key === 'no_rm' || key === 'diagnosis' || key === 'alasan' || key === 'solusi' || key === 'pemberian_antiplatelet';

      // Coerce space-separated enum values to underscored ones for Prisma (only on non-free-text fields)
      if (!isFreeText) {
        if (trimmed === 'tidak dilakukan') {
          finalVal = 'tidak_dilakukan';
        } else if (trimmed === 'tidak ada peluang') {
          finalVal = 'tidak_ada_peluang';
        } else if (trimmed === 'tidak sesuai') {
          finalVal = 'tidak_sesuai';
        } else if (trimmed === 'Tidak Sesuai') {
          finalVal = 'Tidak_Sesuai';
        } else if (trimmed === 'tidak ada') {
          finalVal = 'tidak_ada';
        }
      }

      // Coerce booleans
      if (finalVal === 'true') {
        data[key] = true;
      } else if (finalVal === 'false') {
        data[key] = false;
      }
      // Coerce integers
      else if (
        key.endsWith('_id') ||
        key.startsWith('jumlah_') ||
        key.startsWith('total_') ||
        key.endsWith('_kolf') ||
        key === 'usia' ||
        key === 'selisih_menit' ||
        key === 'kematian_kurang_48jam' ||
        key === 'kematian_lebih_48jam' ||
        key === 'darah_masuk_kolf'
      ) {
        if (finalVal !== '') {
          data[key] = parseInt(finalVal, 10);
        }
      }
      // Coerce dates and times
      else if (key.startsWith('tanggal') && finalVal !== '') {
        data[key] = new Date(finalVal);
      }
      else if ((key.startsWith('jam') || key.endsWith('_jam_operasi') || key.includes('_jam_')) && key !== 'jam_mulai_selesai' && key !== 'jam_mulai' && key !== 'jam_selesai' && finalVal !== '') {
        const hasZ = finalVal.endsWith('Z');
        const cleanVal = hasZ ? finalVal.slice(0, -1) : finalVal;
        const timeStr = cleanVal.split(':').length === 2 ? `${cleanVal}:00` : cleanVal;
        data[key] = new Date(`1970-01-01T${timeStr}Z`);
      }
      else {
        data[key] = finalVal;
      }
    }
  }
  return data;
}

function createGenericService(modelName, options = {}) {
  const model = prisma[modelName];
  if (!model) {
    throw new Error(`Prisma model '${modelName}' not found.`);
  }

  return {
    async getAll(where, page, limit) {
      const skip = (page - 1) * limit;
      const queryWhere = { ...where, ...options.defaultWhere };
      if (options.ignoreUnitId) {
        delete queryWhere.unit_id;
      }
      const [data, total] = await Promise.all([
        model.findMany({
          where: queryWhere,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        model.count({ where: queryWhere }),
      ]);
      return { data, total };
    },

    async create(body, userId) {
      let data = { ...body, created_by: userId };
      if (options.beforeCreate) {
        data = await options.beforeCreate(data);
      }
      
      coerceTypes(data);

      if (data.periode_id && await isPeriodClosed(data.periode_id)) {
        const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
        err.statusCode = 403;
        throw err;
      }

      const record = await model.create({ data });
      if (userId) {
        await prisma.auditLog.create({
          data: {
            user_id: userId,
            tabel: modelName,
            record_id: record.id,
            aksi: 'create',
            data_baru: JSON.parse(JSON.stringify(record)),
          }
        }).catch(err => console.error('Audit log error:', err));
      }
      return record;
    },

    async update(id, body, userId) {
      let data = { ...body };
      if (options.beforeUpdate) {
        data = await options.beforeUpdate(data, id);
      }
      
      // Strip read-only fields
      delete data.id;
      delete data.created_by;
      delete data.created_at;
      delete data.updated_at;

      coerceTypes(data);

      const targetRecord = await model.findUnique({ where: { id } });
      const targetPeriodeId = data.periode_id || targetRecord?.periode_id;
      if (targetPeriodeId && await isPeriodClosed(targetPeriodeId)) {
        const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
        err.statusCode = 403;
        throw err;
      }

      let oldRecord = userId ? targetRecord : null;

      const record = await model.update({ where: { id }, data });

      if (userId && oldRecord) {
        await prisma.auditLog.create({
          data: {
            user_id: userId,
            tabel: modelName,
            record_id: id,
            aksi: 'update',
            data_lama: JSON.parse(JSON.stringify(oldRecord)),
            data_baru: JSON.parse(JSON.stringify(record)),
          }
        }).catch(err => console.error('Audit log error:', err));
      }
      return record;
    },

    async remove(id, userId) {
      const targetRecord = await model.findUnique({ where: { id } });
      if (targetRecord?.periode_id && await isPeriodClosed(targetRecord.periode_id)) {
        const err = new Error('Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.');
        err.statusCode = 403;
        throw err;
      }

      let oldRecord = userId ? targetRecord : null;

      const record = await model.delete({ where: { id } });

      if (userId && oldRecord) {
        await prisma.auditLog.create({
          data: {
            user_id: userId,
            tabel: modelName,
            record_id: id,
            aksi: 'delete',
            data_lama: JSON.parse(JSON.stringify(oldRecord)),
          }
        }).catch(err => console.error('Audit log error:', err));
      }
      return record;
    },

    async getSummary(where) {
      const queryWhere = { ...where, ...options.defaultWhere };
      if (options.ignoreUnitId) {
        delete queryWhere.unit_id;
      }
      if (options.calculateSummary) {
        const data = await model.findMany({ where: queryWhere });
        return options.calculateSummary(data, queryWhere);
      }
      const total = await model.count({ where: queryWhere });
      return { total, numerator: total, persen: 100, standar: '100%' };
    }
  };
}

module.exports = { createGenericService };
