const prisma = require('../config/database');

/**
 * Creates an audit log entry in the audit_log table.
 */
async function createAuditLog({ user_id, aksi = 'update', tabel_target = '', record_id = 0, data_lama = null, data_baru = null }) {
  try {
    const validAksi = (aksi || 'update').toLowerCase();
    const aksiEnum = ['create', 'update', 'delete'].includes(validAksi) ? validAksi : 'update';

    return await prisma.auditLog.create({
      data: {
        user_id: user_id ? parseInt(user_id, 10) : 1,
        tabel: tabel_target || 'settings',
        record_id: record_id ? parseInt(record_id, 10) : 0,
        aksi: aksiEnum,
        data_lama: data_lama ? (typeof data_lama === 'object' ? data_lama : { info: String(data_lama) }) : undefined,
        data_baru: data_baru ? (typeof data_baru === 'object' ? data_baru : { info: String(data_baru) }) : undefined,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err);
    // Silent fail so main transaction completes
    return null;
  }
}

module.exports = {
  createAuditLog,
};
