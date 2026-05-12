const express = require('express');
const router = express.Router();
const { getPriceHistory } = require('../controllers/analyticsController');

router.get('/prices', getPriceHistory);

module.exports = router;
