const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  state: String,
  district: String,
  role: { type: String, default: 'farmer' },
  smsPreferences: {
    weatherAlerts: { type: Boolean, default: false },
    schemeUpdates: { type: Boolean, default: false }
  },
  crops: { type: String, default: 'Wheat, Tomato' },
  landArea: { type: String, default: '2.5' },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);