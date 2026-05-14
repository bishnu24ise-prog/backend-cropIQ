const express = require('express');
const router = express.Router();
const { createOrder, getFarmerOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createOrder);
router.get('/farmer', protect, getFarmerOrders);

module.exports = router;
