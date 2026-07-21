const prisma = require('../../config/database');

function coerceTypes(data) {
  for (const key in data) {
    const val = data[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      let finalVal = trimmed;

      // Coerce space-separated enum values to underscored ones for Prisma
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
      else if (key.startsWith('jam') && key !== 'jam_mulai_selesai' && key !== 'jam_mulai' && key !== 'jam_selesai' && finalVal !== '') {
        data[key] = new Date(`1970-01-01T${finalVal}${finalVal.split(':').length === 2 ? ':00' : ''}Z`);
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

      let oldRecord = null;
      if (userId) {
        oldRecord = await model.findUnique({ where: { id } });
      }

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
      let oldRecord = null;
      if (userId) {
        oldRecord = await model.findUnique({ where: { id } });
      }

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
      const data = await model.findMany({ where: queryWhere });
      if (options.calculateSummary) {
        return options.calculateSummary(data, queryWhere);
      }
      return { total: data.length, numerator: data.length, persen: 100, standar: '100%' };
    }
  };
}

module.exports = { createGenericService };
