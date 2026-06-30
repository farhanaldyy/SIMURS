const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/penandaan-lokasi-operasi.service');

module.exports = createGenericController(service);
