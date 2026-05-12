const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // video, article
  category: String, // Organic Farming, Pest Control, etc.
  contentUrl: String,
  season: String, // Rabi, Kharif, All
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
