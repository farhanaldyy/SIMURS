const prisma = require('../../config/database');

function coerceTypes(data) {
  for (const key in data) {
    const val = data[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      // Coerce booleans
      if (trimmed === 'true') {
        data[key] = true;
      } else if (trimmed === 'false') {
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
        if (trimmed !== '') {
          data[key] = parseInt(trimmed, 10);
        }
      }
      // Coerce dates and times
      else if (key.startsWith('tanggal') && trimmed !== '') {
        data[key] = new Date(trimmed);
      }
      else if (key.startsWith('jam') && key !== 'jam_mulai_selesai' && trimmed !== '') {
        data[key] = new Date(`1970-01-01T${trimmed}${trimmed.split(':').length === 2 ? ':00' : ''}Z`);
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
      const queryWhere = { ...where };
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
        data = options.beforeCreate(data);
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
        data = options.beforeUpdate(data);
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
      const queryWhere = { ...where };
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
