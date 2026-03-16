const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Client, ModelFund, ClientHolding, Session, RebalanceItem } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Main Rebalance Calculation [cite: 22, 23, 25]
app.get('/api/rebalance/:clientId', async (req, res) => {
  const { clientId } = req.params;
  
  const holdings = await ClientHolding.find({ clientId });
  const modelFunds = await ModelFund.find();
  
  const portfolioValue = holdings.reduce((acc, curr) => acc + curr.currentValue, 0);
  
  const analysis = [];
  let totalToBuy = 0;
  let totalToSell = 0;

  // 1. Process Model Funds (including those not currently held)
  modelFunds.forEach(mf => {
    const holding = holdings.find(h => h.fundId === mf.fundId);
    const currentValue = holding ? holding.currentValue : 0;
    const currentPct = (currentValue / portfolioValue) * 100;
    const targetValue = (mf.allocationPct / 100) * portfolioValue;
    const amount = targetValue - currentValue;

    analysis.push({
      fundId: mf.fundId,
      fundName: mf.fundName,
      currentPct: currentPct.toFixed(2),
      targetPct: mf.allocationPct,
      drift: (mf.allocationPct - currentPct).toFixed(2),
      action: amount > 0 ? 'BUY' : 'SELL',
      amount: Math.abs(amount).toFixed(2),
      isModelFund: true
    });

    if (amount > 0) totalToBuy += amount;
    else totalToSell += Math.abs(amount);
  });

  // 2. Identify "REVIEW" funds (held by client but NOT in model)
  holdings.forEach(h => {
    if (!modelFunds.find(mf => mf.fundId === h.fundId)) {
      analysis.push({
        fundId: h.fundId,
        fundName: h.fundName,
        currentPct: ((h.currentValue / portfolioValue) * 100).toFixed(2),
        targetPct: null,
        drift: null,
        action: 'REVIEW',
        amount: h.currentValue.toFixed(2),
        isModelFund: false
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
});

mongoose.connect('mongodb://localhost:27017/portfolio_db').then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});