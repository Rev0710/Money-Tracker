const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// --- FIXED MIDDLEWARE ---
app.use(cors({
  // REMOVED the trailing slash from the Vercel URL
  origin: ["http://localhost:3000", "https://money-tracker-jade-one.vercel.app"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS for preflight
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Port Logic - Optimized for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});

// Export for Vercel (if you decide to move backend to Vercel later)
module.exports = app;