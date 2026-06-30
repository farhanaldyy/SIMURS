const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const dc = require('../controllers/dashboard.controller');

router.use(verifyToken);
router.get('/summary', dc.getSummary);
router.get('/indicator-summaries', dc.getIndicatorSummaries);

module.exports = router;
