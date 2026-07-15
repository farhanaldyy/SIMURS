const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-info-tindakan.service');

module.exports = createGenericController(service);
