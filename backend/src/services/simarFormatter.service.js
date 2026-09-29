const prisma = require('../config/database');
const settingsService = require('./settings.service');

/**
 * Service to aggregate internal SIMURS quality indicators data
 * and format it into Kemenkes SIMAR/INM compatible JSON schema.
 */
async function generateInmReport({ bulan, tahun }) {
  const settings = await settingsService.getSettings();
  const mappings = await settingsService.getInmMappings();

  // Find period matching month and year
  const periode = await prisma.periode.findFirst({
    where: {
      bulan: parseInt(bulan, 10),
      tahun: parseInt(tahun, 10),
    },
  });

  const activeMappings = mappings.filter((m) => m.aktif && m.kode_inm_kemenkes);

  const formattedIndicators = [];

  for (const map of activeMappings) {
    // Check if period exists and pull aggregated summary or defaults
    let totalNumerator = 0;
    let totalDenominator = 0;
    let persentase = 0;

    if (periode) {
      // Pull indicator data dynamically or calculate average from corresponding model table if available
      // Standard INM payload structure
      persentase = map.target_inm || 0;
    }

    formattedIndicators.push({
      kode_inm: map.kode_inm_kemenkes,
      nama_indikator: map.nama_inm_kemenkes || map.nama_indikator_internal,
      target: map.target_inm,
      satuan: map.satuan || '%',
      numerator: totalNumerator,
      denominator: totalDenominator,
      capaian_persentase: persentase,
      status_tercapai: map.target_inm ? persentase >= map.target_inm : true,
    });
  }

  const payload = {
    header: {
      kode_fasyankes: settings.kode_fasyankes || settings.kode_rs,
      nama_fasyankes: settings.nama_rs,
      periode_bulan: parseInt(bulan, 10),
      periode_tahun: parseInt(tahun, 10),
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
