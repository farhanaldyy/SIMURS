const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/gelang-identitas.service');

module.exports = createGenericController(service);
