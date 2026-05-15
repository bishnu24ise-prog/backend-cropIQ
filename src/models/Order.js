const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerName: { type: String, required: false },
  deliveryAddress: { type: String, required: true },
  pincode: { type: String, required: false },
  city: { type: String, required: false },
  contactNumber: { type: String, required: true },
  product: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
