const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-hasil-kritis.service');

module.exports = createGenericController(service);
