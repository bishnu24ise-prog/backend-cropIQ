const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  areaInAcres: {
    type: Number,
    required: true
  },
  soilType: {
    type: String,
    enum: ['sandy', 'clay', 'loamy', 'silt', 'black', 'red'],
  },
  location: {
    state: String,
    district: String,
    village: String
  },
  currentCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  sowingDate: {
    type: Date
  },
  expectedHarvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'fallow', 'harvested'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);