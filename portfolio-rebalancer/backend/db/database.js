const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "model_portfolio.db");

function getDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      client_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT    NOT NULL,
      total_invested REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS model_funds (
      fund_id        INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_name      TEXT    NOT NULL,
      asset_class    TEXT    NOT NULL,
      allocation_pct REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS client_holdings (
      holding_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id     INTEGER NOT NULL REFERENCES clients(client_id),
      fund_id       INTEGER,
      fund_name     TEXT    NOT NULL,
      current_value REAL    NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rebalance_sessions (
      session_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id       INTEGER NOT NULL REFERENCES clients(client_id),
      created_at      TEXT    NOT NULL,
      portfolio_value REAL    NOT NULL,
      total_to_buy    REAL    NOT NULL,
      total_to_sell   REAL    NOT NULL,
      net_cash_needed REAL    NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'PENDING'
    );

    CREATE TABLE IF NOT EXISTS rebalance_items (
      item_id           INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id        INTEGER NOT NULL REFERENCES rebalance_sessions(session_id),
      fund_id           INTEGER,
      fund_name         TEXT    NOT NULL,
      action            TEXT    NOT NULL,
      amount            REAL    NOT NULL,
      current_pct       REAL    NOT NULL,
      target_pct        REAL    NOT NULL,
      post_rebalance_pct REAL   NOT NULL,
      is_model_fund     INTEGER NOT NULL DEFAULT 1
    );
  `);

  db.close();
}

function seedDb() {
  const db = getDb();

 
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM clients").get();
  if (existing.cnt > 0) {
    console.log("Database already seeded.");
    db.close();
    return;
  }

 
  const clientStmt = db.prepare(
    "INSERT INTO clients (client_name, total_invested) VALUES (?, ?)"
  );
  const clientResult = clientStmt.run("Rajesh Kumar", 1500000);
  const clientId = clientResult.lastInsertRowid;

  
  const modelFunds = [
    { name: "HDFC Nifty 50 Index Fund", asset_class: "Large Cap Equity", pct: 35 },
    { name: "Mirae Asset Large Cap Fund", asset_class: "Large Cap Equity", pct: 20 },
    { name: "HDFC Mid Cap Opportunities", asset_class: "Mid Cap Equity", pct: 15 },
    { name: "Parag Parikh Flexi Cap Fund", asset_class: "Flexi Cap Equity", pct: 15 },
    { name: "ICICI Pru Short Term Debt Fund", asset_class: "Debt", pct: 15 },
  ];

  const fundStmt = db.prepare(
    "INSERT INTO model_funds (fund_name, asset_class, allocation_pct) VALUES (?, ?, ?)"
  );

  const fundIds = {};
  for (const fund of modelFunds) {
    const r = fundStmt.run(fund.name, fund.asset_class, fund.pct);
    fundIds[fund.name] = r.lastInsertRowid;
  }

  // Seed client holdings (drifted from model)
  const holdings = [
    { name: "HDFC Nifty 50 Index Fund", value: 580000 },
    { name: "Mirae Asset Large Cap Fund", value: 340000 },
    { name: "HDFC Mid Cap Opportunities", value: 0 },          // Edge case: ₹0
    { name: "Parag Parikh Flexi Cap Fund", value: 295000 },
    { name: "ICICI Pru Short Term Debt Fund", value: 195000 },
    { name: "Axis Bluechip Fund", value: 90000 },               // Edge case: not in model
  ];

  const holdingStmt = db.prepare(
    "INSERT INTO client_holdings (client_id, fund_id, fund_name, current_value) VALUES (?, ?, ?, ?)"
  );

  for (const h of holdings) {
    const fid = fundIds[h.name] || null;
    holdingStmt.run(clientId, fid, h.name, h.value);
  }

  console.log("Database seeded successfully.");
  db.close();
}

module.exports = { getDb, initDb, seedDb };
