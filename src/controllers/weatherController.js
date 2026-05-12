const User = require('../models/User');

// @desc    Get weather data and crop impacts with expanded pesticide advice
// @route   GET /api/weather
// @access  Private
exports.getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const user = await User.findById(req.userId);
    // Increased default crops for hackathon demo to show diversity
    const farmerCrops = user && user.crops ? user.crops : "Wheat, Tomato, Rice, Chilli, Ginger, Garlic, Pudina, Coriander";
    const cropList = farmerCrops.split(',').map(c => c.trim());
    
    // Simulate location-based variance
    let baseTemp = 31;
    let baseCond = 'Sunny';
    
    if (lat && lon) {
        // Simple logic to vary data based on coordinates
        baseTemp = 25 + (Math.abs(parseFloat(lat)) % 15); // Result between 25-40
        baseCond = (parseFloat(lon) % 2 > 1) ? 'Cloudy' : 'Sunny';
    }

    const weather = {
      temperature: Math.round(baseTemp),
      condition: baseCond,
      humidity: 45 + (Math.round(baseTemp) % 10),
      windSpeed: 8 + (Math.round(baseTemp) % 5),
      rainfall: baseCond === 'Cloudy' ? 20 : 0,
      forecast: [
        { day: 'Monday', temp: Math.round(baseTemp), condition: baseCond },
        { day: 'Tuesday', temp: Math.round(baseTemp) - 2, condition: 'Cloudy' },
        { day: 'Wednesday', temp: Math.round(baseTemp) - 5, condition: 'Rainy' },
        { day: 'Thursday', temp: Math.round(baseTemp) - 3, condition: 'Cloudy' },
        { day: 'Friday', temp: Math.round(baseTemp), condition: 'Sunny' },
        { day: 'Saturday', temp: Math.round(baseTemp) + 2, condition: 'Sunny' },
        { day: 'Sunday', temp: Math.round(baseTemp) + 1, condition: 'Partly Cloudy' }
      ]
    };

    // Expanded technical advice map
    const adviceMap = {
      'Wheat': {
        rain: 'Risk of Rust. Use Mancozeb (2.5g/L) if symptoms appear.',
        sunny: 'Good time for Urea top-dressing or Neem Oil spray for aphids.'
      },
      'Tomato': {
        rain: 'Early Blight risk. Apply Copper Oxychloride (3g/L) to prevent rot.',
        sunny: 'Ideal for applying Imidacloprid for whitefly control.'
      },
      'Ginger': {
        rain: 'Rhizome Rot risk. Ensure zero waterlogging. Apply Trichoderma.',
        sunny: 'Perfect for earthing up and applying well-decomposed manure.'
      },
      'Garlic': {
        rain: 'Downy Mildew risk. Spray Metalaxyl + Mancozeb if rain continues.',
        sunny: 'Ideal for Nitrogen application (Ammonium Sulphate) for bulb growth.'
      },
      'Pudina': {
        rain: 'Leaf Spot risk. Prune heavily and ensure high drainage.',
        sunny: 'Water every 2 days. Apply liquid seaweed fertilizer for lush growth.'
      },
      'Coriander': {
        rain: 'Stem Gall risk. Avoid excessive moisture. Use seed treatment next time.',
        sunny: 'Thin the crop now. Apply light irrigation in the evening.'
      },
      'Chilli': {
        rain: 'Fruit Rot risk. Spray Dithane M-45 (2g/L) immediately.',
        sunny: 'Monitor for Thrips; spray Spinosad if leaves are curling.'
      },
      'Rice': {
        rain: 'Blast disease risk. Use Tricyclazole (0.6g/L) as a preventive spray.',
        sunny: 'Apply Zinc Sulfate if leaves show yellowing.'
      },
      // ... existing crops ...
      'Sugarcane': {
        rain: 'Red Rot danger. Improve drainage immediately.',
        sunny: 'Monitor for Borers; use Chlorantraniliprole if needed.'
      },
      'Cotton': {
        rain: 'Risk of Bollworm. Spray Spinosad (0.5ml/L) after rain stops.',
        sunny: 'Perfect for applying growth regulators like Alpha Naphthyl Acetic Acid.'
      },
      'Onion': {
        rain: 'Purple Blotch risk. Spray Tebuconazole (1ml/L) to save the bulbs.',
        sunny: 'Best time for weeding and applying 12:32:16 NPK fertilizer.'
      },
      'Potato': {
        rain: 'Late Blight Alert! Apply Ridomil Gold (2g/L) immediately.',
        sunny: 'Monitor for aphids; spray Thiamethoxam if population is high.'
      },
      'Soybean': {
        rain: 'Pod Blight risk. Use Carbendazim (1g/L) to protect yield.',
        sunny: 'Ideal for foliar spray of Molybdenum to improve nitrogen fixation.'
      }
    };

    const alerts = [];
    cropList.forEach(crop => {
      const advice = adviceMap[crop] || { rain: 'General disease risk. Monitor closely.', sunny: 'Ideal for general maintenance.' };
      
      if (weather.condition === 'Rainy') {
        alerts.push({
          title: `⚠️ ${crop} Disease Alert`,
          priority: 'High',
          impact: `Wet conditions increase risk for ${crop}.`,
          action: advice.rain
        });
      } else if (weather.condition === 'Sunny') {
        alerts.push({
          title: `✅ ${crop} Treatment Window`,
          priority: 'Normal',
          impact: `Perfect conditions for treating ${crop}.`,
          action: advice.sunny
        });
      }
    });

    res.json({ ...weather, alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
