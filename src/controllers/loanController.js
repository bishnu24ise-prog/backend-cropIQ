'use strict';

const Loan = require('../models/Loan');
const { withArmorIQ } = require('../middleware/armoriqMiddleware');

// @desc    Get user's loans
// @route   GET /api/loans
// @access  Private
exports.getMyLoans = async (req, res) => {
  const userId = req.user._id.toString(); // Fixed: was req.userId (bug)

  const plan = {
    goal: 'Read farmer loan records',
    steps: [
      {
        action: 'read_loans',
        tool: 'mongodb',
        mcp: 'cropiq-backend',
        inputs: { userId },
      },
    ],
  };

  await withArmorIQ({ userId, plan, action: 'read_loans', route: 'GET /api/loans', res }, async () => {
    try {
      let loans = await Loan.find({ userId: req.user._id });

      // Auto-seed for demo if user has no loans
      if (loans.length === 0) {
        await Loan.insertMany([
          {
            userId: req.user._id,
            amount: 145000,
            interestRate: 7.5,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lender: 'SBI Agri Loan',
            status: 'active',
          },
          {
            userId: req.user._id,
            amount: 25000,
            interestRate: 12,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            lender: 'Local Cooperative',
            status: 'active',
          },
        ]);
        loans = await Loan.find({ userId: req.user._id });
      }

      res.json({ loans });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// @desc    Add new loan
// @route   POST /api/loans
// @access  Private
exports.addLoan = async (req, res) => {
  const userId = req.user._id.toString(); // Fixed: was req.userId (bug)
  const { amount, interestRate, dueDate, lender } = req.body;

  const plan = {
    goal: 'Add new loan record for farmer',
    steps: [
      {
        action: 'create_loan',
        tool: 'mongodb',
        mcp: 'cropiq-backend',
        inputs: { userId, amount, lender },
      },
    ],
  };

  await withArmorIQ({ userId, plan, action: 'create_loan', route: 'POST /api/loans', res }, async () => {
    try {
      const loan = new Loan({
        userId: req.user._id,
        amount,
        interestRate,
        dueDate,
        lender,
        status: 'active',
      });
      await loan.save();
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
