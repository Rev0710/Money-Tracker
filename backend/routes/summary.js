const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/summary - Dashboard summary
router.get('/', async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    const userId = req.user._id;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Monthly income & expenses
    const monthlyStats = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    let income = 0, expenses = 0;
    monthlyStats.forEach(s => {
      if (s._id === 'income') income = s.total;
      if (s._id === 'expense') expenses = s.total;
    });

    // Total balance (all time)
    const allTimeStats = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    let totalIncome = 0, totalExpenses = 0;
    allTimeStats.forEach(s => {
      if (s._id === 'income') totalIncome = s.total;
      if (s._id === 'expense') totalExpenses = s.total;
    });

    // Spending by category this month
    const spendingByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Cash flow (last 5 months)
    const cashFlow = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const stats = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: mStart, $lte: mEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]);

      const monthData = { month: mStart.toLocaleString('default', { month: 'short' }), income: 0, expenses: 0 };
      stats.forEach(s => {
        if (s._id === 'income') monthData.income = s.total;
        if (s._id === 'expense') monthData.expenses = s.total;
      });
      cashFlow.push(monthData);
    }

    res.json({
      totalBalance: totalIncome - totalExpenses,
      income,
      expenses,
      savings: income - expenses,
      spendingByCategory,
      cashFlow
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
