const simarService = require('../services/simarFormatter.service');
const simarExcelService = require('../services/simarExcel.service');
const settingsService = require('../services/settings.service');

async function exportInmReport(req, res, next) {
  try {
    const { bulan = new Date().getMonth() + 1, tahun = new Date().getFullYear() } = req.query;

    const reportPayload = await simarService.generateInmReport({ bulan, tahun });

    // Log the export action in integration log
    await settingsService.createIntegrationLog({
      target_system: 'SIMAR',
      action: 'EXPORT_JSON',
      status: 'SUCCESS',
      payload: { bulan, tahun },
      response: { summary: `Generated ${reportPayload.total_indikator_inm} INM indicators` },
      created_by: req.user ? req.user.id : null,
    });

    res.json({
      success: true,
      data: reportPayload,
    });
  } catch (error) {
    next(error);
  }
}

async function exportInmExcel(req, res, next) {
  try {
    const { bulan = new Date().getMonth() + 1, tahun = new Date().getFullYear() } = req.query;

    const workbook = await simarExcelService.generateSimarExcelWorkbook({ bulan, tahun });

    // Log the export action in integration log
    await settingsService.createIntegrationLog({
      target_system: 'SIMAR',
      action: 'EXPORT_EXCEL',
      status: 'SUCCESS',
      payload: { bulan, tahun },
      response: { filename: `SIMAR_INM_Report_${bulan}_${tahun}.xlsx` },
      created_by: req.user ? req.user.id : null,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Laporan_SIMAR_INM_${bulan}_${tahun}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportInmReport,
  exportInmExcel,
};
