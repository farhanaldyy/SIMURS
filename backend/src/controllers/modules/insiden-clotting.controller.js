const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/insiden-clotting.service');

module.exports = createGenericController(service);
