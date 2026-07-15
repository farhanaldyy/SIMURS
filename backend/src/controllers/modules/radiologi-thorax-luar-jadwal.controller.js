const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-thorax-luar-jadwal.service');

module.exports = createGenericController(service);
