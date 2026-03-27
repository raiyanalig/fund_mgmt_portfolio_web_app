# RebalancePro  Portfolio Rebalancing Application

A full-stack web application to compare a client's mutual fund portfolio against a model portfolio and calculate rebalancing recommendations.

## Tech Stack
- **Backend**: Node.js + Express + better-sqlite3 (raw SQL, no ORM)
- **Frontend**: React 18 + TailwindCSS
- **Database**: SQLite (`model_portfolio.db`)

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start        # starts on http://localhost:5000
# DB is auto-created and seeded on first run
```

### 2. Frontend
```bash
cd frontend
npm install
npm start        # starts on http://localhost:3000
```

> The frontend `package.json` has `"proxy": "http://localhost:5000"` so all `/api/*` calls are automatically forwarded.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio/rebalance` | Rebalancing recommendation |
| POST | `/api/portfolio/rebalance/save` | Save session to DB |
| GET | `/api/portfolio/holdings` | Client's current holdings |
| GET | `/api/portfolio/model` | Model fund allocations |
| PUT | `/api/portfolio/model` | Update model allocations |
| GET | `/api/portfolio/history` | All rebalance sessions |
| GET | `/api/portfolio/history/:id` | Items for one session |
| PATCH | `/api/portfolio/history/:id/status` | Update session status |

## Algorithm

1. **Total value** = sum of ALL holdings (including non-model funds)
2. **current_pct** = `(fund_value / total) × 100`
3. **drift** = `target_pct − current_pct`
4. **amount** = `|drift / 100 × total|`
5. **action**: drift > 0 → BUY, drift < 0 → SELL, drift = 0 → HOLD, not in model → REVIEW
6. **net_cash_needed** = `total_to_buy − total_to_sell`

## Edge Cases Handled

| Case | Behaviour |
|------|-----------|
| Fund in model, ₹0 invested | current_pct = 0, action = BUY |
| Fund in holdings, not in model | action = REVIEW, no amount |
| Model doesn't sum to 100% | API returns 422, save blocked |
| Perfectly allocated fund | action = HOLD, amount = ₹0 |
| Sell amounts | Stored/displayed as positive with SELL label |
| DB writes | Wrapped in transactions (all-or-nothing) |

## Seed Data (Rajesh Kumar — ₹15,00,000 portfolio)

| Fund | Current Value | Target % | Action |
|------|--------------|----------|--------|
| HDFC Nifty 50 Index Fund | ₹5,80,000 | 35% | SELL |
| Mirae Asset Large Cap Fund | ₹3,40,000 | 20% | SELL |
| HDFC Mid Cap Opportunities | ₹0 | 15% | BUY |
| Parag Parikh Flexi Cap Fund | ₹2,95,000 | 15% | SELL |
| ICICI Pru Short Term Debt Fund | ₹1,95,000 | 15% | BUY |

