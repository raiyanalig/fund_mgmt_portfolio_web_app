
function round(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}


function getAction(drift, isModelFund) {
  if (!isModelFund) return "REVIEW";
  if (drift > 0.001) return "BUY";
  if (drift < -0.001) return "SELL";
  return "HOLD";
}

/**
 * Core rebalancing calculation.
 *
 * @param {Array} modelFunds   
 * @param {Array} holdings    
 * @returns {Object}          

 */
function calculateRebalancing(modelFunds, holdings) {
  // Step 1: Total portfolio value includes ALL holdings
  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + h.current_value,
    0
  );

  if (totalPortfolioValue === 0) {
    return {
      items: [],
      totalPortfolioValue: 0,
      totalToBuy: 0,
      totalToSell: 0,
      netCashNeeded: 0,
    };
  }

 
  const modelFundMap = new Map(
    modelFunds.map((f) => [f.fund_name.trim().toLowerCase(), f])
  );

  // Step 3: Track which holdings are covered by the model
  const coveredHoldings = new Set();

  // Step 4: Process model funds (including those with ₹0 in holdings)
  const items = modelFunds.map((mf) => {
    const key = mf.fund_name.trim().toLowerCase();
    const holding = holdings.find(
      (h) => h.fund_name.trim().toLowerCase() === key
    );

    const currentValue = holding ? holding.current_value : 0;
    if (holding) coveredHoldings.add(holding.holding_id);

    const currentPct = round((currentValue / totalPortfolioValue) * 100);
    const targetPct = round(mf.allocation_pct);
    const drift = round(targetPct - currentPct);
    const action = getAction(drift, true);

    // Amount to buy/sell in ₹
    // drift / 100 converts % back to a decimal multiplier
    const rawAmount = (drift / 100) * totalPortfolioValue;
    const amount = round(Math.abs(rawAmount));

    // Post-rebalance % will equal target % (for model funds)
    const postRebalancePct = action === "HOLD" ? currentPct : targetPct;

    return {
      fund_id: mf.fund_id,
      fund_name: mf.fund_name,
      asset_class: mf.asset_class,
      action,
      amount: action === "HOLD" ? 0 : amount,
      current_pct: currentPct,
      target_pct: targetPct,
      drift,
      post_rebalance_pct: postRebalancePct,
      is_model_fund: true,
      current_value: currentValue,
    };
  });

  // Step 5: Process holdings NOT in the model → REVIEW
  const reviewItems = holdings
    .filter((h) => !coveredHoldings.has(h.holding_id))
    .map((h) => {
      const currentPct = round((h.current_value / totalPortfolioValue) * 100);
      return {
        fund_id: h.fund_id,
        fund_name: h.fund_name,
        asset_class: "N/A",
        action: "REVIEW",
        amount: 0,
        current_pct: currentPct,
        target_pct: 0,
        drift: round(-currentPct), // entire allocation is "excess"
        post_rebalance_pct: currentPct,
        is_model_fund: false,
        current_value: h.current_value,
      };
    });

  const allItems = [...items, ...reviewItems];

  // Step 6: Aggregate totals
  const totalToBuy = round(
    allItems
      .filter((i) => i.action === "BUY")
      .reduce((sum, i) => sum + i.amount, 0)
  );

  const totalToSell = round(
    allItems
      .filter((i) => i.action === "SELL")
      .reduce((sum, i) => sum + i.amount, 0)
  );

  const netCashNeeded = round(totalToBuy - totalToSell);

  return {
    items: allItems,
    totalPortfolioValue: round(totalPortfolioValue),
    totalToBuy,
    totalToSell,
    netCashNeeded,
  };
}

/**
 * Validate that model fund percentages sum to exactly 100%.
 * Returns { valid: boolean, sum: number }
 */
function validateModelAllocations(funds) {
  const sum = round(funds.reduce((acc, f) => acc + f.allocation_pct, 0));
  return { valid: sum === 100, sum };
}

module.exports = { calculateRebalancing, validateModelAllocations, round };
