const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laundry-ketepatan-linen.service');

module.exports = createGenericController(service);
