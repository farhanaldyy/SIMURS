const prisma = require('../config/database');

/**
 * Helper to check if a specific period ID is locked (status === 'closed')
 * @param {number|string} periodeId 
 * @returns {Promise<boolean>}
 */
async function isPeriodClosed(periodeId) {
  if (!periodeId) return false;
  const id = parseInt(periodeId, 10);
  if (isNaN(id)) return false;
  
  const periode = await prisma.periode.findUnique({
    where: { id },
    select: { status: true }
  });
  return periode ? periode.status === 'closed' : false;
}

/**
 * Express middleware to block CUD operations if the target period is closed
 */
async function checkPeriodLock(req, res, next) {
  try {
    const periodeId = req.body?.periode_id || req.query?.periode_id || req.params?.periode_id;
    if (periodeId) {
      const locked = await isPeriodClosed(periodeId);
      if (locked) {
        return res.status(403).json({
          success: false,
          message: 'Periode ini telah dikunci (closed). Data tidak dapat ditambah, diubah, atau dihapus.'
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { isPeriodClosed, checkPeriodLock };
