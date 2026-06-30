const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/asesmen-pra-bedah.service');

module.exports = createGenericController(service);
