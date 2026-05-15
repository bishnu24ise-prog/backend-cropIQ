const express = require('express');
const router = express.Router();
const { createOrder, getFarmerOrders, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/farmer', protect, getFarmerOrders);

module.exports = router;
