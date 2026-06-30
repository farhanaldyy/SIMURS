const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/angka-kematian-igd.service');

module.exports = createGenericController(service);
