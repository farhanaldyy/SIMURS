const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/kepuasan-pasien-pelayanan.service');

module.exports = createGenericController(service);
