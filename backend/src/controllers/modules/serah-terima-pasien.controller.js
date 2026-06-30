const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/serah-terima-pasien.service');

module.exports = createGenericController(service);
