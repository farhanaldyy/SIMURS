const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-waktu-tunggu-lt-140.service');

module.exports = createGenericController(service);
