const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: String,
  description: String,
  amount: String,
  deadline: Date,
  difficulty: String, // Easy, Medium, Hard
  eligibleStates: [String],
  eligibleCrops: [String],
  requirements: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', schemeSchema);
