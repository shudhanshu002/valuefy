require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Atlas Connection Error:", err));

// 2. Schema Registration
const modelFundSchema = new mongoose.Schema({
  fundId: String,
  fundName: String,
  assetClass: String,
  allocationPct: Number
});

const holdingSchema = new mongoose.Schema({
  clientId: String,
  fundId: String,
  fundName: String,
  currentValue: Number
});

const sessionSchema = new mongoose.Schema({
  clientId: String,
  createdAt: { type: Date, default: Date.now },
  portfolioValue: Number,
  totalToBuy: Number,
  totalToSell: Number,
  netCashNeeded: Number,
  status: { type: String, default: 'PENDING' }
});

const itemSchema = new mongoose.Schema({
  sessionId: mongoose.Schema.Types.ObjectId,
  fundId: String,
  fundName: String,
  action: String,
  amount: Number,
  currentPct: Number,
  targetPct: Number
});

// 3. Model Initialization
const ModelFund = mongoose.model('ModelFund', modelFundSchema);
const Holding = mongoose.model('Holding', holdingSchema);
const Session = mongoose.model('Session', sessionSchema);
const RebalanceItem = mongoose.model('RebalanceItem', itemSchema);

// 4. API Endpoints

// SCREEN 1 & 2 Logic: Portfolio Analysis
app.get('/api/rebalance/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const [holdings, modelFunds] = await Promise.all([
      Holding.find({ clientId }),
      ModelFund.find()
    ]);

    if (!holdings.length) return res.status(404).json({ message: "No holdings found" });

    // portfolioValue = sum(current_value of all client holdings)
    const portfolioValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
    let totalToBuy = 0, totalToSell = 0;
    const analysis = [];

    // Map Model Funds
    modelFunds.forEach(mf => {
      const holding = holdings.find(h => h.fundId === mf.fundId);
      const currentValue = holding ? holding.currentValue : 0;
      
      // currentPct = (fund_value / portfolioValue) * 100
      const currentPct = (currentValue / portfolioValue) * 100;
      
      // targetValue = (targetPct / 100) * portfolioValue
      const targetValue = (mf.allocationPct / 100) * portfolioValue;
      
      // amount = targetValue - currentValue
      const amount = targetValue - currentValue;

      analysis.push({
        fundId: mf.fundId,
        fundName: mf.fundName,
        targetPct: mf.allocationPct,
        currentPct: currentPct.toFixed(2),
        drift: (mf.allocationPct - currentPct).toFixed(2),
        action: amount > 0 ? 'BUY' : 'SELL',
        amount: Math.abs(amount).toFixed(2)
      });

      if (amount > 0) totalToBuy += amount;
      else totalToSell += Math.abs(amount);
    });

    // Handle REVIEW Case (Funds in holdings but NOT in model plan)
    holdings.forEach(h => {
      if (!modelFunds.find(mf => mf.fundId === h.fundId)) {
        analysis.push({
          fundId: h.fundId,
          fundName: h.fundName,
          action: 'REVIEW',
          amount: h.currentValue.toFixed(2),
          currentPct: ((h.currentValue / portfolioValue) * 100).toFixed(2),
          targetPct: null
        });
        totalToSell += h.currentValue;
      }
    });

    res.json({
      analysis,
      totals: {
        totalToBuy: totalToBuy.toFixed(2),
        totalToSell: totalToSell.toFixed(2),
        netCashNeeded: (totalToBuy - totalToSell).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE SESSION Logic
app.post('/api/rebalance/save', async (req, res) => {
  try {
    const { clientId, totals, analysis } = req.body;
    const session = await Session.create({
      clientId,
      portfolioValue: parseFloat(totals.totalToBuy) + parseFloat(totals.totalToSell),
      totalToBuy: totals.totalToBuy,
      totalToSell: totals.totalToSell,
      netCashNeeded: totals.netCashNeeded,
      status: 'PENDING'
    });

    const items = analysis.map(it => ({ sessionId: session._id, ...it }));
    await RebalanceItem.insertMany(items);
    res.json({ success: true, sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SCREEN 2: Current Investments Data
app.get('/api/clients/:id/holdings', async (req, res) => {
  const holdings = await Holding.find({ clientId: req.params.id });
  res.json(holdings);
});

// SCREEN 3: History Data
app.get('/api/rebalance/history/:clientId', async (req, res) => {
  const sessions = await Session.find({ clientId: req.params.clientId }).sort({ createdAt: -1 });
  res.json(sessions);
});

// SCREEN 4: Get & Update Model Plan
app.get('/api/model-funds', async (req, res) => {
  const funds = await ModelFund.find();
  res.json(funds);
});



app.put('/api/model-funds/update', async (req, res) => {
  const { funds } = req.body;
  for (let fund of funds) {
    await ModelFund.findOneAndUpdate({ fundId: fund.fundId }, { allocationPct: fund.allocationPct });
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));