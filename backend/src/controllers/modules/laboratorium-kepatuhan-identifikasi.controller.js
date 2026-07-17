const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-kepatuhan-identifikasi.service');

module.exports = createGenericController(service);
