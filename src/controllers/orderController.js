'use strict';

const Order = require('../models/Order');
const MarketItem = require('../models/MarketItem');
const { withArmorIQ } = require('../middleware/armoriqMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (protect middleware added to route — was previously public)
exports.createOrder = async (req, res) => {
  const userId = req.user._id.toString();
  const { buyerName, deliveryAddress, pincode, city, contactNumber, product, totalPrice, quantity, marketItemId, farmerId } = req.body;

  if (!buyerName || !deliveryAddress || !contactNumber || !product || !totalPrice) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const plan = {
    goal: 'Create a new marketplace order and deduct inventory',
    steps: [
      {
        action: 'create_order',
        tool: 'mongodb',
        mcp: 'cropiq-backend',
        inputs: {
          userId,
          farmerId,
          product,
          totalPrice,
          quantity: quantity || 1,
        },
      },
      ...(marketItemId && quantity
        ? [
            {
              action: 'deduct_inventory',
              tool: 'mongodb',
              mcp: 'cropiq-backend',
              inputs: { marketItemId, quantity: Number(quantity) },
            },
          ]
        : []),
    ],
  };

  await withArmorIQ({ userId, plan, action: 'create_order', route: 'POST /api/orders', res }, async () => {
    try {
      console.log('📥 Received order request:', req.body);

      // 1. Create and save the order first
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
        farmerId,
      });

      const createdOrder = await order.save();

      const rollbackOrder = async (orderId) => {
        try {
          await Order.findByIdAndDelete(orderId);
        } catch (rollbackErr) {
          console.error(JSON.stringify({
            ts: new Date().toISOString(),
            event: 'ARMORIQ_ORPHAN_ORDER_CLEANUP_FAILED',
            orderId: orderId.toString(),
            reason: rollbackErr.message
          }));
        }
      };

      // 2. If marketItemId is provided, attempt to deduct inventory
      if (marketItemId && quantity) {
        const parsedQuantity = Number(quantity);

        const marketItem = await MarketItem.findById(marketItemId);
        if (!marketItem) {
          // Manual Rollback
          await rollbackOrder(createdOrder._id);
          return res.status(404).json({ error: 'Market listing not found' });
        }

        const currentStock = Number(marketItem.quantity) || 0;
        if (currentStock < parsedQuantity) {
          // Manual Rollback
          await rollbackOrder(createdOrder._id);
          return res.status(400).json({ error: `Insufficient stock. Only ${currentStock} available.` });
        }

        // Deduct stock
        try {
          await MarketItem.findByIdAndUpdate(
            marketItemId,
            { $inc: { quantity: -parsedQuantity } },
            { new: true, runValidators: true }
          );
        } catch (err) {
          // Manual Rollback if update query fails
          await rollbackOrder(createdOrder._id);
          throw err;
        }
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// @desc    Get all orders for a farmer
// @route   GET /api/orders/farmer
// @access  Private — read-only, not ArmorIQ-protected per scope decision
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
// @access  Public — read-only, not ArmorIQ-protected
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
// @access  Private (protect middleware added to route — was previously public)
exports.updateOrderStatus = async (req, res) => {
  const userId = req.user._id.toString();
  const { status } = req.body;
  const orderId = req.params.id;

  const plan = {
    goal: 'Update order fulfillment status',
    steps: [
      {
        action: 'update_order_status',
        tool: 'mongodb',
        mcp: 'cropiq-backend',
        inputs: { userId, orderId, status },
      },
    ],
  };

  await withArmorIQ(
    { userId, plan, action: 'update_order_status', route: 'PATCH /api/orders/:id', res },
    async () => {
      try {
        const order = await Order.findByIdAndUpdate(
          orderId,
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
    }
  );
};
