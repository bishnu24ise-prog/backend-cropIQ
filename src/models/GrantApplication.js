const mongoose = require('mongoose');

const grantApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  estimatedLoss: Number,
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GrantApplication', grantApplicationSchema);
