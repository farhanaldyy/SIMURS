const { createGenericService } = require('./generic.service');

const service = createGenericService('angkaKematian', {
  defaultWhere: { lokasi: 'igd' },
  beforeCreate(data) {
    return { ...data, lokasi: 'igd' };
  },
  beforeUpdate(data) {
    return { ...data, lokasi: 'igd' };
  },
  calculateSummary(data) {
    const total = data.length;
    const kurang8Jam = data.filter(d => {
      const masuk = new Date(d.tanggal_masuk);
      const jamM = new Date(d.jam_masuk);
      masuk.setHours(jamM.getHours(), jamM.getMinutes(), jamM.getSeconds(), 0);

      const keluar = new Date(d.tanggal_keluar);
      const jamK = new Date(d.jam_keluar);
      keluar.setHours(jamK.getHours(), jamK.getMinutes(), jamK.getSeconds(), 0);

      const diffMs = keluar - masuk;
      const diffHours = diffMs / 3600000;
      return diffHours < 8;
    }).length;

    return {
      total,
      numerator: kurang8Jam,
      persen: total > 0 ? ((kurang8Jam / total) * 100).toFixed(2) : 0,
      standar: '0%'
    };
  }
});

module.exports = service;
