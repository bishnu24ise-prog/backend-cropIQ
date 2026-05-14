const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerName: { type: String, required: false },
  deliveryAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  product: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
