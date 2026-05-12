const express = require('express');
const router = express.Router();
const { diagnoseCrop, getDiagnosisHistory, deleteDiagnosis, chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

// Matches your frontend api.js exactly
router.post('/crop-diagnosis', protect, upload.single('image'), diagnoseCrop);
router.get('/crop-diagnosis/history', protect, getDiagnosisHistory);
router.delete('/crop-diagnosis/:id', protect, deleteDiagnosis);
router.post('/ai/chat', chatWithAI);

module.exports = router;
