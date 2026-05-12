const express = require('express');
const router = express.Router();
const { addCrop, getAllCrops, getCropById, updateCrop, deleteCrop } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCrops);
router.get('/:id', getCropById);
router.post('/', protect, addCrop);
router.put('/:id', protect, updateCrop);
router.delete('/:id', protect, deleteCrop);

module.exports = router;