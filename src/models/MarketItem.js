const mongoose = require('mongoose');

const marketItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cropName: String,
  mandi: String,
  unit: String,
  quantity: { type: Number, required: true, min: 0 },
  pricePerUnit: Number,
  totalPrice: Number,
  status: { type: String, default: 'listed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketItem', marketItemSchema);
