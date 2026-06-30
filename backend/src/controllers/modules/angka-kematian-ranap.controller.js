const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/angka-kematian-ranap.service');

module.exports = createGenericController(service);
