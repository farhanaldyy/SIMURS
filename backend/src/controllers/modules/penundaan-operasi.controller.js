const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/penundaan-operasi.service');

module.exports = createGenericController(service);
