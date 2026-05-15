const Order = require('../models/Order');
const MarketItem = require('../models/MarketItem');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or protected if buyers must login, assuming public for hackathon to match market page state)
exports.createOrder = async (req, res) => {
  try {
    console.log("📥 Received order request:", req.body);
    const { buyerName, deliveryAddress, pincode, city, contactNumber, product, totalPrice, quantity, marketItemId, farmerId } = req.body;

    if (!buyerName || !deliveryAddress || !contactNumber || !product || !totalPrice) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Deduct inventory if marketItemId is provided
    if (marketItemId && quantity) {
      const parsedQuantity = Number(quantity);
      
      const marketItem = await MarketItem.findById(marketItemId);
      if (!marketItem) {
        return res.status(404).json({ error: 'Market listing not found' });
      }
      
      const currentStock = Number(marketItem.quantity) || 0;
      if (currentStock < parsedQuantity) {
        return res.status(400).json({ error: `Insufficient stock. Only ${currentStock} available.` });
      }

      // Use atomic $inc to prevent race conditions and strictly enforce number deduction
      await MarketItem.findByIdAndUpdate(
        marketItemId,
        { $inc: { quantity: -parsedQuantity } },
        { new: true, runValidators: true }
      );
    }

    const order = new Order({
      buyerName: buyerName || 'Guest Buyer',
      deliveryAddress,
      pincode,
      city,
      contactNumber,
      product,
      totalPrice,
      quantity: quantity || 1,
      marketItemId,
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
    // req.user comes from the protect middleware
    const orders = await Order.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders (Admin/Demo route)
// @route   GET /api/orders
// @access  Public
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id
// @access  Public
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
