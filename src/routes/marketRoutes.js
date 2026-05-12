const express = require('express');
const router = express.Router();
const { getMarketItems, sellCrop } = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMarketItems);
router.post('/sell', protect, sellCrop);

module.exports = router;
