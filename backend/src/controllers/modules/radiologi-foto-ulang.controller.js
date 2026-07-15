const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/radiologi-foto-ulang.service');

module.exports = createGenericController(service);
