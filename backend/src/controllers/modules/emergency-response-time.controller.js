const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/emergency-response-time.service');

module.exports = createGenericController(service);
