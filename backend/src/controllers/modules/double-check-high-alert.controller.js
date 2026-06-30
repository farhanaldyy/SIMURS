const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/double-check-high-alert.service');

module.exports = createGenericController(service);
