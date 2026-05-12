const express = require('express');
const router = express.Router();
const { addField, getMyFields, updateField, deleteField } = require('../controllers/fieldController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyFields);
router.post('/', protect, addField);
router.put('/:id', protect, updateField);
router.delete('/:id', protect, deleteField);

module.exports = router;