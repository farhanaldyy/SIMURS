const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/pasien-tertahan-igd.service');

module.exports = createGenericController(service);
