const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-kesalahan-input.service');

module.exports = createGenericController(service);
