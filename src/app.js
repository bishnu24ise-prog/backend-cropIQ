require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const performSeeding = require('./utils/seeder');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const loanRoutes = require('./routes/loanRoutes');
const marketRoutes = require('./routes/marketRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const debtFundRoutes = require('./routes/debtFundRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Connect Database
connectDB().then(() => {
  // Run seeder
  performSeeding();
});

// ✅ Fixed CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api', aiRoutes); // handles /crop-diagnosis and /ai/chat
app.use('/api', schemeRoutes); // handles /schemes and /knowledge
app.use('/api/community', communityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/debt-fund', debtFundRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));