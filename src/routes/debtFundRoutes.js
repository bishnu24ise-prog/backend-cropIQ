const express = require('express');
const router = express.Router();
const { applyForGrant, getFundStats } = require('../controllers/debtFundController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyForGrant);
router.get('/stats', getFundStats);

module.exports = router;
