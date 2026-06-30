const express = require('express');
const router = express.Router();
const { createOrder, getFarmerOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/orders — now requires authentication (was previously public)
// ArmorIQ protection applied inside the controller via withArmorIQ()
router.post('/', protect, createOrder);

// GET /api/orders — public read for admin/demo listing, unchanged
router.get('/', getAllOrders);

// GET /api/orders/farmer — authenticated farmer's own orders, unchanged
router.get('/farmer', protect, getFarmerOrders);

// PATCH /api/orders/:id — now requires authentication (was previously public)
// ArmorIQ protection applied inside the controller via withArmorIQ()
router.patch('/:id', protect, updateOrderStatus);

module.exports = router;
