const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  cropName: String,
  month: String, // Jan, Feb, Mar...
  year: Number,
  price: Number,
  predicted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
