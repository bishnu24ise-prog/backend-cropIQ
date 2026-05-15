const MarketItem = require('../models/MarketItem');

// @desc    Get all market listings
// @route   GET /api/market
// @access  Public
exports.getMarketItems = async (req, res) => {
  try {
    const items = await MarketItem.find().populate('userId', 'name district').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new market listing
// @route   POST /api/market/sell
// @access  Private
exports.sellCrop = async (req, res) => {
  try {
    const { cropName, mandi, unit, quantity, pricePerUnit } = req.body;
    const newItem = new MarketItem({
      userId: req.user._id,
      cropName,
      mandi,
      unit,
      quantity,
      pricePerUnit,
      totalPrice: quantity * pricePerUnit,
      status: 'listed'
    });
    await newItem.save();
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
