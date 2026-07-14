const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laundry-linen-hilang.service');

module.exports = createGenericController(service);
