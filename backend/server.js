const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/summary', require('./routes/summary'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'MoneyTracker API is running!', status: 'ok' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// MongoDB Connection Logic
// We don't "await" the connection here so the app can export immediately
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Handle local development vs Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running on port ${PORT}`);
  });
}

// CRITICAL: Export for Vercel
module.exports = app;