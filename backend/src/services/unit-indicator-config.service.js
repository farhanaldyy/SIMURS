const prisma = require('../config/database');
const { AVAILABLE_INDICATORS } = require('../config/indicators.config');

/**
 * Service untuk Pengaturan Konfigurasi Indikator per Unit
 */

/**
 * Mengambil daftar master indikator yang tersedia
 */
async function getAllAvailableIndicators() {
  return AVAILABLE_INDICATORS;
}

/**
 * Mengambil daftar konfigurasi indikator untuk unit tertentu
 */
async function getConfigsByUnit(unitId) {
  const parsedUnitId = parseInt(unitId, 10);
  if (isNaN(parsedUnitId)) {
    throw new Error('ID Unit tidak valid');
  }

  const unit = await prisma.unit.findUnique({
    where: { id: parsedUnitId }
  });

  if (!unit) {
    throw new Error('Unit tidak ditemukan');
  }

  // Ambil konfigurasi tersimpan dari database
  const savedConfigs = await prisma.unitIndicatorConfig.findMany({
    where: { unit_id: parsedUnitId }
  });

  const savedMap = new Map();
  savedConfigs.forEach(c => savedMap.set(c.indicator_id, c.aktif));

  // Gabungkan dengan master indicators
  // Jika unit belum memiliki settingan sama sekali, aktifkan indikator yang sesuai dengan kategori defaultnya
  const hasSavedSettings = savedConfigs.length > 0;

  const result = AVAILABLE_INDICATORS.map(ind => {
    let isActive = false;
    if (hasSavedSettings) {
      isActive = savedMap.has(ind.id) ? savedMap.get(ind.id) : false;
    } else {
      // Default fallback berdasarkan kategori unit
      isActive = ind.kategori_default.includes(unit.kategori_unit) || ind.kategori_default.includes('rawat_inap');
    }

    return {
      ...ind,
      aktif: isActive
    };
  });

  return {
    unit: {
      id: unit.id,
      nama_unit: unit.nama_unit,
      kode_unit: unit.kode_unit,
      kategori_unit: unit.kategori_unit
    },
    indicators: result
  };
}

/**
 * Menyimpan konfigurasi indikator aktif untuk suatu unit
 */
async function saveUnitConfigs(unitId, activeIndicatorIds = []) {
  const parsedUnitId = parseInt(unitId, 10);
  if (isNaN(parsedUnitId)) {
    throw new Error('ID Unit tidak valid');
  }

  const unit = await prisma.unit.findUnique({
    where: { id: parsedUnitId }
  });

  if (!unit) {
    throw new Error('Unit tidak ditemukan');
  }

  const activeSet = new Set(activeIndicatorIds);

  // Proses upsert/update untuk seluruh indikator
  const operations = AVAILABLE_INDICATORS.map(ind => {
    const isAktif = activeSet.has(ind.id);
    return prisma.unitIndicatorConfig.upsert({
      where: {
        unit_id_indicator_id: {
          unit_id: parsedUnitId,
          indicator_id: ind.id
        }
      },
      update: {
        aktif: isAktif
      },
      create: {
        unit_id: parsedUnitId,
        indicator_id: ind.id,
        aktif: isAktif
      }
    });
  });

  await prisma.$transaction(operations);

  return getConfigsByUnit(parsedUnitId);
}

module.exports = {
  getAllAvailableIndicators,
  getConfigsByUnit,
  saveUnitConfigs
};
