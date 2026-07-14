const prisma = require('../../config/database');
const { createGenericService } = require('./generic.service');

function checkTepatWaktu(jamGanti, jamJadwal) {
  if (!jamGanti || !jamJadwal) return false;
  
  const d1 = typeof jamGanti === 'string' 
    ? new Date(`1970-01-01T${jamGanti}${jamGanti.split(':').length === 2 ? ':00' : ''}Z`) 
    : new Date(jamGanti);
  const d2 = typeof jamJadwal === 'string' 
    ? new Date(`1970-01-01T${jamJadwal}${jamJadwal.split(':').length === 2 ? ':00' : ''}Z`) 
    : new Date(jamJadwal);
    
  return d1.getTime() <= d2.getTime();
}

const baseService = createGenericService('laundryKetepatanLinen', {
  beforeCreate(data) {
    data.tepat_waktu = checkTepatWaktu(data.jam_ganti, data.jam_jadwal);
    return data;
  },
  beforeUpdate(data) {
    if (data.jam_ganti !== undefined && data.jam_jadwal !== undefined) {
      data.tepat_waktu = checkTepatWaktu(data.jam_ganti, data.jam_jadwal);
    }
    return data;
  },
  calculateSummary(data) {
    const total = data.length;
    const tepatWaktuCount = data.filter(d => d.tepat_waktu === true).length;
    const tidakTepatWaktuCount = total - tepatWaktuCount;
    const persen = total > 0 ? parseFloat(((tepatWaktuCount / total) * 100).toFixed(2)) : 0;
    
    return {
      total,
      numerator: tepatWaktuCount,
      tidak_tepat: tidakTepatWaktuCount,
      denominator: total,
      persen,
      standar: '100%'
    };
  }
});

module.exports = baseService;
