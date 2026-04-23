const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const month = Number(req.query.month ?? (new Date().getMonth() + 1));
    const year = Number(req.query.year ?? new Date().getFullYear());

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    });

    // Calculate spent for each budget category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    spendingByCategory.forEach((s) => {
      spendingMap[s._id] = s.total;
    });

    const budgetsWithSpending = budgets.map((b) => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
    }));

    res.json(budgetsWithSpending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category } = req.body;
    const limit = Number(req.body.limit);
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    if (!category || !Number.isFinite(limit) || !Number.isFinite(month) || !Number.isFinite(year)) {
      return res.status(400).json({ message: 'category, limit, month, and year are required' });
    }

    const existing = await Budget.findOne({ user: req.user._id, category, month, year });

    if (existing) {
      const updated = await Budget.findByIdAndUpdate(existing._id, { limit }, { new: true });
      return res.json(updated);
    }

    const budget = await Budget.create({ user: req.user._id, category, limit, month, year });
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;