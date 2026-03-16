const mongoose = require('mongoose');


const ClientSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  totalInvested: Number
});


const ModelFundSchema = new mongoose.Schema({
  fundId: { type: String, required: true, unique: true },
  fundName: { type: String, required: true },
  assetClass: { type: String, enum: ['EQUITY', 'DEBT', 'GOLD'] },
  allocationPct: { type: Number, required: true }
});


const ClientHoldingSchema = new mongoose.Schema({
  clientId: String,
  fundId: String,
  fundName: String,
  currentValue: Number
});


const SessionSchema = new mongoose.Schema({
  clientId: String,
  createdAt: { type: Date, default: Date.now },
  portfolioValue: Number,
  totalToBuy: Number,
  totalToSell: Number,
  netCashNeeded: Number,
  status: { type: String, default: 'PENDING', enum: ['PENDING', 'APPLIED', 'DISMISSED'] }
});


const RebalanceItemSchema = new mongoose.Schema({
  sessionId: mongoose.Schema.Types.ObjectId,
  fundId: String,
  fundName: String,
  action: { type: String, enum: ['BUY', 'SELL', 'REVIEW'] },
  amount: Number,
  currentPct: Number,
  targetPct: Number,
  postRebalancePct: Number,
  isModelFund: Boolean
});

module.exports = {
  Client: mongoose.model('Client', ClientSchema),
  ModelFund: mongoose.model('ModelFund', ModelFundSchema),
  ClientHolding: mongoose.model('ClientHolding', ClientHoldingSchema),
  Session: mongoose.model('Session', SessionSchema),
  RebalanceItem: mongoose.model('RebalanceItem', RebalanceItemSchema)
};