const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/waktu-tanggap-komplain.service');

module.exports = createGenericController(service);
