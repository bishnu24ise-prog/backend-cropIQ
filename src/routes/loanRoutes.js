const express = require('express');
const router = express.Router();
const { getMyLoans, addLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMyLoans)
  .post(protect, addLoan);

module.exports = router;
