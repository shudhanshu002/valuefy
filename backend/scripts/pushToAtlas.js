require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');

// 1. Connect to Atlas (Ensure your .env has MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI);

// 2. Define Models with correct field names
const Client = mongoose.model('Client', new mongoose.Schema({ clientId: String, name: String }));
const ModelFund = mongoose.model('ModelFund', new mongoose.Schema({ fundId: String, fundName: String, allocationPct: Number }));
const Holding = mongoose.model('Holding', new mongoose.Schema({ clientId: String, fundId: String, fundName: String, currentValue: Number }));

const db = new sqlite3.Database('./data/model_portfolio.db');

async function startMigration() {
    console.log("Starting Clean Migration to Atlas...");
    
    // Clear existing data to avoid duplicates
    await Promise.all([Client.deleteMany({}), ModelFund.deleteMany({}), Holding.deleteMany({})]);

    // Migrate Clients
    db.all("SELECT * FROM clients", [], async (err, rows) => {
        for (const r of rows) {
            await Client.create({ clientId: r.client_id, name: r.client_name });
        }
        console.log("✅ Clients Migrated");
    });

    // Migrate Model Funds
    db.all("SELECT * FROM model_funds", [], async (err, rows) => {
        for (const r of rows) {
            await ModelFund.create({ fundId: r.fund_id, fundName: r.fund_name, allocationPct: r.allocation_pct });
        }
        console.log("✅ Model Funds Migrated");
    });

    // Migrate Holdings (Explicitly mapping client_id to clientId)
    db.all("SELECT * FROM client_holdings", [], async (err, rows) => {
        for (const r of rows) {
            await Holding.create({ 
                clientId: r.client_id, // Maps SQL client_id to Mongo clientId
                fundId: r.fund_id, 
                fundName: r.fund_name, 
                currentValue: r.current_value 
            });
        }
        console.log(`✅ ${rows.length} Holdings Migrated. Total value for C001 should be ₹5,80,000.`);
    });
}

startMigration();