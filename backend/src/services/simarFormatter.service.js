const prisma = require('../config/database');
const settingsService = require('./settings.service');
const rekapMutuService = require('./rekap-mutu.service');

/**
 * Service to aggregate internal SIMURS quality indicators data
 * and format it into Kemenkes SIMAR/INM compatible JSON schema.
 */
async function generateInmReport({ bulan, tahun }) {
  const selectedBulan = parseInt(bulan, 10) || (new Date().getMonth() + 1);
  const selectedTahun = parseInt(tahun, 10) || new Date().getFullYear();

  const settings = await settingsService.getSettings();
  const mappings = await settingsService.getInmMappings();

  // Fetch real aggregated INM data from SIMURS rekap mutu service
  const inmRekapMap = new Map();
  try {
    const rekap = await rekapMutuService.getRekapMutuData({
      kategori: 'inm',
      tahun: selectedTahun,
      bulanAwal: selectedBulan,
      bulanAkhir: selectedBulan,
      unitId: 'all',
    });
    if (rekap && rekap.totalRs) {
      rekap.totalRs.forEach((item) => {
        const normKey = (item.id || '').replace(/-/g, '_').toLowerCase();
        inmRekapMap.set(normKey, item);
      });
    }
  } catch (err) {
    console.warn('Gagal menarik data rekap mutu INM untuk SIMAR:', err.message);
  }

  const activeMappings = mappings.filter((m) => m.aktif && m.kode_inm_kemenkes);
  const formattedIndicators = [];

  for (const map of activeMappings) {
    let totalNumerator = 0;
    let totalDenominator = 0;
    let persentase = 0;

    const normInternalId = (map.indicator_id || map.indikator_internal_id || '').replace(/-/g, '_').toLowerCase();
    const indData = inmRekapMap.get(normInternalId);

    if (indData) {
      const mData = indData.monthlyData && indData.monthlyData[selectedBulan];
      if (mData) {
        totalNumerator = typeof mData.numerator === 'number' ? mData.numerator : 0;
        totalDenominator = typeof mData.denominator === 'number' ? mData.denominator : 0;
        persentase = typeof mData.capaian === 'number' ? mData.capaian : 0;
      } else if (indData.totalPeriode) {
        totalNumerator = typeof indData.totalPeriode.numerator === 'number' ? indData.totalPeriode.numerator : 0;
        totalDenominator = typeof indData.totalPeriode.denominator === 'number' ? indData.totalPeriode.denominator : 0;
        persentase = typeof indData.totalPeriode.capaian === 'number' ? indData.totalPeriode.capaian : 0;
      }
    }

    const targetVal = map.target_inm !== undefined && map.target_inm !== null ? map.target_inm : null;
    const isTercapai = targetVal !== null ? persentase >= targetVal : true;

    formattedIndicators.push({
      kode_inm: map.kode_inm_kemenkes,
      nama_indikator: map.nama_inm_kemenkes || map.nama_indikator_internal,
      target: targetVal,
      satuan: map.satuan || '%',
      numerator: totalNumerator,
      denominator: totalDenominator,
      capaian_persentase: persentase,
      status_tercapai: isTercapai,
    });
  }

  const payload = {
    header: {
      kode_fasyankes: settings.kode_fasyankes || settings.kode_rs,
      nama_fasyankes: settings.nama_rs,
      periode_bulan: selectedBulan,
      periode_tahun: selectedTahun,
      mode_integrasi: settings.integration_mode,
      inm_endpoint: settings.inm_api_url || null,
      generated_at: new Date().toISOString(),
    },
    total_indikator_inm: formattedIndicators.length,
    indikator_list: formattedIndicators,
  };

  return payload;
}

module.exports = {
  generateInmReport,
};
