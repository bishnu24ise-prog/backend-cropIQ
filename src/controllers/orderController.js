const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or protected if buyers must login, assuming public for hackathon to match market page state)
exports.createOrder = async (req, res) => {
  try {
    const { buyerName, deliveryAddress, pincode, city, contactNumber, product, totalPrice, farmerId } = req.body;
    
    if (!deliveryAddress || !contactNumber || !product || !totalPrice || !farmerId) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const order = new Order({
      buyerName: buyerName || 'Guest Buyer',
      deliveryAddress,
      pincode,
      city,
      contactNumber,
      product,
      totalPrice,
      farmerId
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders for a farmer
// @route   GET /api/orders/farmer
// @access  Private
exports.getFarmerOrders = async (req, res) => {
  try {
    // req.userId comes from the protect middleware
    const orders = await Order.find({ farmerId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
