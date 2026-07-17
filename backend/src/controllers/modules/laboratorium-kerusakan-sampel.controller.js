const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-kerusakan-sampel.service');

module.exports = createGenericController(service);
