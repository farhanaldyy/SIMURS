const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/surgical-checklist-operasi.service');

module.exports = createGenericController(service);
