const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-thorax-sesuai-jadwal.service');

module.exports = createGenericController(service);
