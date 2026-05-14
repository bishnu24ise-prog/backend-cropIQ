require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const MarketItem = require('./models/MarketItem');

const fixMarketItems = async () => {
  await connectDB();
  
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in DB to assign as seller.');
      process.exit(1);
    }

    const items = await MarketItem.find();
    for (const item of items) {
      if (!item.userId) {
        item.userId = user._id;
        // Since old data might have 'name' instead of 'cropName'
        if (item.name && !item.cropName) item.cropName = item.name;
        if (item.price && !item.pricePerUnit) item.pricePerUnit = item.price;
        await item.save();
        console.log(`Updated item ${item._id} with userId ${user._id} and standardized field names.`);
      }
    }
    console.log('✅ All market items fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing items:', error);
    process.exit(1);
  }
};

fixMarketItems();
