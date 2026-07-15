const prisma = require('../../config/database');
const { createGenericService } = require('./generic.service');

const baseService = createGenericService('radiologiThoraxLuarJadwal', {
  beforeCreate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.waktu !== undefined) data.waktu = parseInt(data.waktu) || 0;
    return data;
  },
  beforeUpdate(data) {
    if (data.jumlah_pasien !== undefined) data.jumlah_pasien = parseInt(data.jumlah_pasien) || 0;
    if (data.waktu !== undefined) data.waktu = parseInt(data.waktu) || 0;
    return data;
  },
  async calculateSummary(data, queryWhere) {
    const total = data.length;
    const totalPasien = data.reduce((sum, d) => sum + (d.jumlah_pasien || 0), 0);
    const totalWaktu = data.reduce((sum, d) => sum + (d.waktu || 0), 0);
    const rataRata = totalPasien > 0 ? Math.round(totalWaktu / totalPasien) : 0;

    // Find doctor schedule
    const jadwal = await prisma.radiologiJadwalDokter.findFirst({
      where: {
        periode_id: queryWhere.periode_id,
        unit_id: queryWhere.unit_id
      }
    });

    const hari = jadwal ? jadwal.hari : '(Jadwal Hari belum diatur)';
    const jam = jadwal ? `${jadwal.jam_mulai} - ${jadwal.jam_selesai}` : '(Jam Praktek belum diatur)';

    return {
      total,
      total_pasien: totalPasien,
      total_waktu: totalWaktu,
      rataRata,
      standar: '≤ 180 menit',
      category: 'Radiologi',
      jadwal_hari: hari,
      jam_praktek: jam
    };
  }
});

const originalGetAll = baseService.getAll;
baseService.getAll = async function(where, page, limit) {
  const result = await originalGetAll(where, page, limit);
  result.data = result.data.map(d => {
    const jp = d.jumlah_pasien || 0;
    const waktu = d.waktu || 0;
    return {
      ...d,
      hasil: jp > 0 ? Math.round(waktu / jp) : 0
    };
  });
  return result;
};

module.exports = baseService;
