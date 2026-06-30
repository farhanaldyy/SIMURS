const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/informed-consent-anestesi.service');

module.exports = createGenericController(service);
