const { createGenericService } = require('./generic.service');
const prisma = require('../../config/database');

const apdSchema = [
  { apdKey: 'penutup_kepala', reqKey: 'apd_penutup_kepala' },
  { apdKey: 'face_shield', reqKey: 'apd_face_shield' },
  { apdKey: 'masker', reqKey: 'apd_masker' },
  { apdKey: 'apron', reqKey: 'apd_apron' },
  { apdKey: 'coverall', reqKey: 'apd_coverall' },
  { apdKey: 'sarung_tangan', reqKey: 'apd_sarung_tangan' },
  { apdKey: 'cover_shoes', reqKey: 'apd_cover_shoes' }
];

const baseService = createGenericService('kepatuhanApd', {
  async calculateSummary(data) {
    const masterList = await prisma.masterTindakan.findMany();
    const tindakanMap = {};
    masterList.forEach(m => { 
      if (m.nama) tindakanMap[m.nama.trim().toLowerCase()] = m; 
    });

    const total = data.length;
    let totalYa = 0;
    let totalWajib = 0;

    data.forEach(d => {
      const tKey = d.tindakan ? d.tindakan.trim().toLowerCase() : '';
      const masterObj = tindakanMap[tKey];

      let requiredKeys = [];
      if (masterObj) {
        requiredKeys = apdSchema.filter(item => masterObj[item.reqKey] === true).map(item => item.apdKey);
      }
      
      // If no APD specified in master or master not found, default to all 7 items
      if (requiredKeys.length === 0) {
        requiredKeys = apdSchema.map(item => item.apdKey);
      }

      const wajibCount = requiredKeys.length;
      const patuhCount = requiredKeys.filter(k => d[k] === true).length;

      totalYa += patuhCount;
      totalWajib += wajibCount;
    });

    const persen = totalWajib > 0 ? parseFloat(((totalYa / totalWajib) * 100).toFixed(2)) : 100;

    return {
      total,
      numerator: totalYa,
      denominator: totalWajib,
      persen,
      standar: '100%'
    };
  }
});

const service = {
  ...baseService,
  async getAll(where, page, limit) {
    const res = await baseService.getAll(where, page, limit);
    const masterList = await prisma.masterTindakan.findMany();
    const tindakanMap = {};
    masterList.forEach(m => { 
      if (m.nama) tindakanMap[m.nama.trim().toLowerCase()] = m; 
    });

    res.data = res.data.map(d => {
      const tKey = d.tindakan ? d.tindakan.trim().toLowerCase() : '';
      const masterObj = tindakanMap[tKey];

      return {
        ...d,
        master_tindakan: masterObj || null
      };
    });

    return res;
  }
};

module.exports = service;
