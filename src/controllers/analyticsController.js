const PriceHistory = require('../models/PriceHistory');

// @desc    Get price history analytics
// @route   GET /api/analytics/prices
// @access  Public
exports.getPriceHistory = async (req, res) => {
  try {
    const cropName = req.query.crop || 'Wheat';
    const history = await PriceHistory.find({ cropName }).sort({ year: 1, month: 1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
