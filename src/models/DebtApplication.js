const mongoose = require('mongoose');

const debtApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  estimatedLoss: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  aiScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DebtApplication', debtApplicationSchema);
