const Loan = require('../models/Loan');

// @desc    Get user's loans
// @route   GET /api/loans
// @access  Private
exports.getMyLoans = async (req, res) => {
  try {
    let loans = await Loan.find({ userId: req.userId });
    
    // Auto-seed for demo if user has no loans
    if (loans.length === 0) {
      await Loan.insertMany([
        { userId: req.userId, amount: 145000, interestRate: 7.5, dueDate: new Date(Date.now() + 30*24*60*60*1000), lender: 'SBI Agri Loan', status: 'active' },
        { userId: req.userId, amount: 25000, interestRate: 12, dueDate: new Date(Date.now() + 15*24*60*60*1000), lender: 'Local Cooperative', status: 'active' }
      ]);
      loans = await Loan.find({ userId: req.userId });
    }
    
    res.json({ loans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add new loan
// @route   POST /api/loans
// @access  Private
exports.addLoan = async (req, res) => {
  try {
    const { amount, interestRate, dueDate, lender } = req.body;
    const loan = new Loan({
      userId: req.userId,
      amount,
      interestRate,
      dueDate,
      lender,
      status: 'active'
    });
    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
