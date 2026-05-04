const { getDb } = require("../db/database");
const queries = require("../db/queries");
const {
  calculateRebalancing,
  validateModelAllocations,
} = require("./portfolioCalculator");

// ── GET /api/portfolio/rebalance ─────────────────────────────────────────────
// Returns full rebalancing recommendation for the default client.
function getRebalanceRecommendation(req, res) {
  let db;
  try {
    db = getDb();

    const client = db.prepare(queries.getClient).get();
    if (!client) return res.status(404).json({ error: "No client found" });

    const modelFunds = db.prepare(queries.getAllModelFunds).all();
    const holdings = db
      .prepare(queries.getClientHoldings)
      .all(client.client_id);

    // Validate model percentages
    const { valid, sum } = validateModelAllocations(modelFunds);
    if (!valid) {
      return res.status(422).json({
        error: `Model portfolio allocations sum to ${sum}% instead of 100%. Please fix before viewing recommendations.`,
      });
    }

    const result = calculateRebalancing(modelFunds, holdings);

    res.json({
      client,
      ...result,
    });
  } catch (err) {
    console.error("getRebalanceRecommendation error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── GET /api/portfolio/holdings ──────────────────────────────────────────────
// Returns client holdings with portfolio percentage for each fund.
function getHoldings(req, res) {
  let db;
  try {
    db = getDb();

    const client = db.prepare(queries.getClient).get();
    if (!client) return res.status(404).json({ error: "No client found" });

    const holdings = db
      .prepare(queries.getClientHoldings)
      .all(client.client_id);

    const totalRow = db
      .prepare(queries.getTotalPortfolioValue)
      .get(client.client_id);
    const total = totalRow.total;

    const enriched = holdings.map((h) => ({
      ...h,
      percentage:
        total > 0
          ? Math.round((h.current_value / total) * 10000) / 100
          : 0,
    }));

    res.json({
      client,
      holdings: enriched,
      totalPortfolioValue: total,
    });
  } catch (err) {
    console.error("getHoldings error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── GET /api/portfolio/model ──────────────────────────────────────────────────
// Returns model fund allocations.
function getModelFunds(req, res) {
  let db;
  try {
    db = getDb();
    const funds = db.prepare(queries.getAllModelFunds).all();
    res.json({ funds });
  } catch (err) {
    console.error("getModelFunds error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── PUT /api/portfolio/model ──────────────────────────────────────────────────
// Updates allocation percentages for model funds.
// Body: { funds: [{ fund_id, allocation_pct }] }
function updateModelFunds(req, res) {
  let db;
  try {
    const { funds } = req.body;

    if (!Array.isArray(funds) || funds.length === 0) {
      return res.status(400).json({ error: "funds array is required" });
    }

    // Validate sum BEFORE writing to DB
    const { valid, sum } = validateModelAllocations(funds);
    if (!valid) {
      return res.status(422).json({
        error: `Allocations must sum to exactly 100%. Current sum: ${sum}%`,
      });
    }

    db = getDb();

    // Use a transaction so either ALL updates succeed or NONE do
    const updateStmt = db.prepare(queries.updateModelFundAllocation);
    const transaction = db.transaction((fundList) => {
      for (const f of fundList) {
        updateStmt.run(f.allocation_pct, f.fund_id);
      }
    });

    transaction(funds);

    res.json({ success: true, message: "Model portfolio updated successfully" });
  } catch (err) {
    console.error("updateModelFunds error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── POST /api/portfolio/rebalance/save ────────────────────────────────────────
// Saves a rebalancing session and its line items.
function saveRebalanceSession(req, res) {
  let db;
  try {
    db = getDb();

    const client = db.prepare(queries.getClient).get();
    if (!client) return res.status(404).json({ error: "No client found" });

    const modelFunds = db.prepare(queries.getAllModelFunds).all();
    const holdings = db
      .prepare(queries.getClientHoldings)
      .all(client.client_id);

    const { valid, sum } = validateModelAllocations(modelFunds);
    if (!valid) {
      return res.status(422).json({
        error: `Cannot save: model allocations sum to ${sum}%`,
      });
    }

    const calc = calculateRebalancing(modelFunds, holdings);

    const insertSession = db.prepare(queries.insertSession);
    const insertItem = db.prepare(queries.insertRebalanceItem);

    const transaction = db.transaction(() => {
      const sessionResult = insertSession.run(
        client.client_id,
        new Date().toISOString(),
        calc.totalPortfolioValue,
        calc.totalToBuy,
        calc.totalToSell,
        calc.netCashNeeded
      );

      const sessionId = sessionResult.lastInsertRowid;

      for (const item of calc.items) {
        insertItem.run(
          sessionId,
          item.fund_id,
          item.fund_name,
          item.action,
          item.amount,
          item.current_pct,
          item.target_pct,
          item.post_rebalance_pct,
          item.is_model_fund ? 1 : 0
        );
      }

      return sessionId;
    });

    const sessionId = transaction();

    res.status(201).json({
      success: true,
      sessionId,
      message: "Rebalancing recommendation saved",
    });
  } catch (err) {
    console.error("saveRebalanceSession error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── GET /api/portfolio/history ────────────────────────────────────────────────
// Returns all rebalance sessions for the client.
function getRebalanceHistory(req, res) {
  let db;
  try {
    db = getDb();

    const client = db.prepare(queries.getClient).get();
    if (!client) return res.status(404).json({ error: "No client found" });

    const sessions = db
      .prepare(queries.getAllSessions)
      .all(client.client_id);

    res.json({ client, sessions });
  } catch (err) {
    console.error("getRebalanceHistory error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── GET /api/portfolio/history/:sessionId ─────────────────────────────────────
// Returns items for a specific session.
function getSessionItems(req, res) {
  let db;
  try {
    db = getDb();

    const { sessionId } = req.params;
    const session = db.prepare(queries.getSessionById).get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const items = db.prepare(queries.getItemsBySession).all(sessionId);
    res.json({ session, items });
  } catch (err) {
    console.error("getSessionItems error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

// ── PATCH /api/portfolio/history/:sessionId/status ────────────────────────────
// Updates session status (PENDING → APPLIED / DISMISSED).
function updateSessionStatus(req, res) {
  let db;
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    const allowed = ["PENDING", "APPLIED", "DISMISSED"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${allowed.join(", ")}` });
    }

    db = getDb();
    db.prepare(queries.updateSessionStatus).run(status, sessionId);
    res.json({ success: true, sessionId, status });
  } catch (err) {
    console.error("updateSessionStatus error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
}

module.exports = {
  getRebalanceRecommendation,
  getHoldings,
  getModelFunds,
  updateModelFunds,
  saveRebalanceSession,
  getRebalanceHistory,
  getSessionItems,
  updateSessionStatus,
};
