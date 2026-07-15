const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-identifikasi-pasien.service');

module.exports = createGenericController(service);
