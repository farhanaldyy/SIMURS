const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-ekspertisi-dokter.service');

module.exports = createGenericController(service);
