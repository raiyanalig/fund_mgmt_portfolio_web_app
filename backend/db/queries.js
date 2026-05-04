

const queries = {
 
  getClient: `
    SELECT client_id, client_name, total_invested
    FROM clients
    LIMIT 1
  `,

 
  getAllModelFunds: `
    SELECT fund_id, fund_name, asset_class, allocation_pct
    FROM model_funds
    ORDER BY allocation_pct DESC
  `,

  updateModelFundAllocation: `
    UPDATE model_funds
    SET allocation_pct = ?
    WHERE fund_id = ?
  `,

  getClientHoldings: `
    SELECT
      h.holding_id,
      h.client_id,
      h.fund_id,
      h.fund_name,
      h.current_value
    FROM client_holdings h
    WHERE h.client_id = ?
    ORDER BY h.current_value DESC
  `,

  getTotalPortfolioValue: `
    SELECT COALESCE(SUM(current_value), 0) AS total
    FROM client_holdings
    WHERE client_id = ?
  `,


  insertSession: `
    INSERT INTO rebalance_sessions
      (client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, status)
    VALUES
      (?, ?, ?, ?, ?, ?, 'PENDING')
  `,

  getAllSessions: `
    SELECT
      session_id,
      client_id,
      created_at,
      portfolio_value,
      total_to_buy,
      total_to_sell,
      net_cash_needed,
      status
    FROM rebalance_sessions
    WHERE client_id = ?
    ORDER BY created_at DESC
  `,

  updateSessionStatus: `
    UPDATE rebalance_sessions
    SET status = ?
    WHERE session_id = ?
  `,

  getSessionById: `
    SELECT * FROM rebalance_sessions WHERE session_id = ?
  `,

  // ── REBALANCE ITEMS ───────────────────────────────────────────────────
  insertRebalanceItem: `
    INSERT INTO rebalance_items
      (session_id, fund_id, fund_name, action, amount, current_pct, target_pct, post_rebalance_pct, is_model_fund)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  getItemsBySession: `
    SELECT *
    FROM rebalance_items
    WHERE session_id = ?
    ORDER BY action, amount DESC
  `,
};

module.exports = queries;
