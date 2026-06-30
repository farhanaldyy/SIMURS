const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/informed-consent-pembedahan.service');

module.exports = createGenericController(service);
