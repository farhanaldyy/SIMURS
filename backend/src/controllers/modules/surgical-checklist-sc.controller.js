const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/surgical-checklist-sc.service');

module.exports = createGenericController(service);
