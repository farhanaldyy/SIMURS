const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/kembali-icu.service');

module.exports = createGenericController(service);
