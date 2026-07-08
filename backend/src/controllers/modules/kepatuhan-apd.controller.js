const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/kepatuhan-apd.service');

module.exports = createGenericController(service);
