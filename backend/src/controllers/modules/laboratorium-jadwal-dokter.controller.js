const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-jadwal-dokter.service');

module.exports = createGenericController(service);
