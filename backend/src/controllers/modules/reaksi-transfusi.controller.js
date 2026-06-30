const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/reaksi-transfusi.service');

module.exports = createGenericController(service);
