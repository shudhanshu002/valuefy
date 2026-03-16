require('dotenv').config();
const Database = require('better-sqlite3');
const mongoose = require('mongoose');


const schemas = {
  Client: mongoose.model('Client', new mongoose.Schema({
    clientId: String, name: String, totalInvested: Number
  })),
  ModelFund: mongoose.model('ModelFund', new mongoose.Schema({
    fundId: String, fundName: String, assetClass: String, allocationPct: Number
  })),
  Holding: mongoose.model('Holding', new mongoose.Schema({
    clientId: String, fundId: String, fundName: String, currentValue: Number
  }))
};

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const sqlDb = new Database('./data/model_portfolio.db');

    
    const clients = sqlDb.prepare('SELECT * FROM clients').all();
    await schemas.Client.deleteMany({});
    await schemas.Client.insertMany(clients.map(c => ({
      clientId: c.client_id, name: c.client_name, totalInvested: c.total_invested
    })));

    
    const modelFunds = sqlDb.prepare('SELECT * FROM model_funds').all();
    await schemas.ModelFund.deleteMany({});
    await schemas.ModelFund.insertMany(modelFunds.map(f => ({
      fundId: f.fund_id, fundName: f.fund_name, asset_class: f.asset_class, allocationPct: f.allocation_pct
    })));

    
    const holdings = sqlDb.prepare('SELECT * FROM client_holdings').all();
    await schemas.Holding.deleteMany({});
    await schemas.Holding.insertMany(holdings.map(h => ({
      clientId: h.client_id, fundId: h.fund_id, fundName: h.fund_name, currentValue: h.current_value
    })));

    console.log("Migration Successful: All data pushed to Atlas.");
    process.exit(0);
  } catch (err) {
    console.error("Migration Failed:", err);
    process.exit(1);
  }
}

runMigration();