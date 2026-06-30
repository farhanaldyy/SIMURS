const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/visit-dokter.service');

module.exports = createGenericController(service);
