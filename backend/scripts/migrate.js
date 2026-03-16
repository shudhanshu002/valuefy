const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const { Client, ModelFund, ClientHolding } = require('../server/models');

mongoose.connect('mongodb://localhost:27017/portfolio_db');

const db = new sqlite3.Database('./data/model_portfolio.db');

const migrate = async () => {
  db.serialize(() => {
    // Migrate Clients [cite: 26, 66, 67]
    db.all("SELECT * FROM clients", [], async (err, rows) => {
      for (const row of rows) {
        await Client.findOneAndUpdate(
          { clientId: row.client_id },
          { name: row.client_name, totalInvested: row.total_invested },
          { upsert: true }
        );
      }
      console.log("Clients migrated.");
    });

    // Migrate Model Funds [cite: 25, 26, 146]
    db.all("SELECT * FROM model_funds", [], async (err, rows) => {
      for (const row of rows) {
        await ModelFund.findOneAndUpdate(
          { fundId: row.fund_id },
          { fundName: row.fund_name, assetClass: row.asset_class, allocationPct: row.allocation_pct },
          { upsert: true }
        );
      }
      console.log("Model Funds migrated.");
    });

    // Migrate Client Holdings [cite: 25, 221, 222, 223]
    db.all("SELECT * FROM client_holdings", [], async (err, rows) => {
      for (const row of rows) {
        await ClientHolding.create({
          clientId: row.client_id,
          fundId: row.fund_id,
          fundName: row.fund_name,
          currentValue: row.current_value
        });
      }
      console.log("Client Holdings migrated.");
    });
  });
};

migrate();