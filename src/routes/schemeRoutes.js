const express = require('express');
const router = express.Router();
const { getSchemes, getKnowledgeBase } = require('../controllers/schemeController');

router.get('/schemes', getSchemes);
router.get('/knowledge', getKnowledgeBase);

module.exports = router;
