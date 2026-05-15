const Scheme = require('../models/Scheme');
const Article = require('../models/Article');

const performSeeding = async () => {
  try {
    await Article.deleteMany({});
    
    await Article.insertMany([
      // Your custom links (Set 1)
      { title: 'Essential Sustainable Farming Guide', description: 'Expert techniques for modern agriculture.', type: 'video', category: 'General', contentUrl: 'https://www.youtube.com/embed/ZkCSGoPxATE' },
      { title: 'Organic Fertilizer Masterclass', description: 'Make 100% organic fertilizer at home.', type: 'video', category: 'Organic', contentUrl: 'https://www.youtube.com/embed/Ulf8E1XnhgI' },
      { title: 'Advanced Crop Protection Secrets', description: 'Protect your crops from pests and disease.', type: 'video', category: 'Protection', contentUrl: 'https://www.youtube.com/embed/mxxC2-MZ7j8' },
      
      // Your custom links (Set 2)
      { title: 'Advanced Hydroponics for Farmers', description: 'Grow high-value crops without soil.', type: 'video', category: 'Tech', contentUrl: 'https://www.youtube.com/embed/uv3BWiJ5CZ4' },
      { title: 'Drip Irrigation Maintenance', description: 'Keep your irrigation system at 100% efficiency.', type: 'video', category: 'Irrigation', contentUrl: 'https://www.youtube.com/embed/vbKHqBgKr_Y' },
      { title: 'Smart Greenhouse Construction', description: 'Build a low-cost greenhouse.', type: 'video', category: 'Infrastructure', contentUrl: 'https://www.youtube.com/embed/Wh-frOl-hRA' },
      { title: 'Precision Agriculture Overview', description: 'Using data to maximize harvest.', type: 'video', category: 'Data', contentUrl: 'https://www.youtube.com/embed/HJl0cPLMTZ0' },

      // Remaining Highlights
      { title: 'LIVE: Modern Agriculture 2026', description: 'Recording of our live expert session.', type: 'video', category: 'General', contentUrl: 'https://www.youtube.com/embed/Fg8295f6mSQ' },
      { title: 'Sustainable Crop Rotation Plan', description: 'A masterclass on planning your seasons.', type: 'video', category: 'Sustainability', contentUrl: 'https://www.youtube.com/embed/NcDKtUk8Xys' },
      
      // New additions
      { title: 'Daily Tractor Maintenance Guide', description: 'Keep your machinery running flawlessly all year round.', type: 'video', category: 'Machinery', contentUrl: 'https://www.youtube.com/embed/EnzVh9QRQA0' },
      { title: 'Understanding Government Subsidies', description: 'Learn how to apply for and maximize government grants.', type: 'video', category: 'Finance', contentUrl: 'https://www.youtube.com/embed/aAMotAMyS9s' }
    ]);
    
    console.log('✅ Academy Library Updated (IoT & Storage Removed)!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = performSeeding;
