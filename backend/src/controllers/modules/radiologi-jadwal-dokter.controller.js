const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-jadwal-dokter.service');

module.exports = createGenericController(service);
