const Scheme = require('../models/Scheme');
const Article = require('../models/Article');

// @desc    Get all government schemes
// @route   GET /api/schemes
// @access  Public
exports.getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json({ schemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get knowledge base articles
// @route   GET /api/knowledge
// @access  Public
exports.getKnowledgeBase = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
