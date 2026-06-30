const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/asesmen-awal-igd.service');

module.exports = createGenericController(service);
