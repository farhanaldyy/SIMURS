const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-kesalahan-penyerahan.service');

module.exports = createGenericController(service);
