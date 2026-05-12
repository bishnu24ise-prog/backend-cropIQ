const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['vegetable', 'fruit', 'grain', 'pulse', 'cash crop'],
    required: true
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'all season'],
    required: true
  },
  growthDuration: {
    type: Number,
  },
  waterRequirement: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  soilType: {
    type: String,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);