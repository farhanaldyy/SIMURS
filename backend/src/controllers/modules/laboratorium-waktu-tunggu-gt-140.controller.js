const { createGenericController } = require('./generic.controller');
const service = require('../../services/modules/laboratorium-waktu-tunggu-gt-140.service');

module.exports = createGenericController(service);
