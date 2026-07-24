const rekapService = require('../services/rekap-mutu.service');

async function getRekapData(req, res, next) {
  try {
    const { kategori, tahun, bulanAwal, bulanAkhir, unitId } = req.query;
    const data = await rekapService.getRekapMutuData({
      kategori: kategori || 'rawat_inap',
      tahun: tahun || 2026,
      bulanAwal: bulanAwal || 1,
      bulanAkhir: bulanAkhir || 3,
      unitId: unitId || 'all'
    });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

async function exportExcel(req, res, next) {
  try {
    const { kategori, tahun, bulanAwal, bulanAkhir, unitId } = req.query;
    const wb = await rekapService.exportRekapMutuExcel({
      kategori: kategori || 'rawat_inap',
      tahun: tahun || 2026,
      bulanAwal: bulanAwal || 1,
      bulanAkhir: bulanAkhir || 3,
      unitId: unitId || 'all'
    });

    const filename = `Rekap_Data_Mutu_${kategori || 'rawat_inap'}_${tahun || 2026}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRekapData,
  exportExcel
};
