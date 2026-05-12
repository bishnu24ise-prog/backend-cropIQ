const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  cropType: String,
  disease: String,
  confidence: Number,
  symptoms: [String],
  treatment: {
    organic: [String],
    chemical: [String]
  },
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
