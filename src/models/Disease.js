const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  affectedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  symptoms: {
    type: [String],
  },
  cause: {
    type: String,
    enum: ['fungal', 'bacterial', 'viral', 'pest', 'nutrient deficiency'],
  },
  treatment: {
    type: String,
  },
  preventiveMeasures: {
    type: [String],
  },
  imageUrl: {
    type: String,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { timestamps: true });

module.exports = mongoose.model('Disease', diseaseSchema);