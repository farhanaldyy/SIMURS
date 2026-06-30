const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/asesmen-pra-anestesi.service');

module.exports = createGenericController(service);
