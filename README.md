# RebalancePro Portfolio Rebalancing Application

A full-stack web application that compares a client’s mutual fund portfolio against a model portfolio and generates intelligent portfolio rebalancing recommendations.

---

## 🚀 Features

- Compare current holdings with model portfolio
- Automated BUY / SELL / HOLD recommendations
- Portfolio drift calculation
- Rebalancing amount calculation
- Session history tracking
- Model portfolio management
- SQLite database integration
- Responsive React frontend
- RESTful API architecture

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- better-sqlite3 (Raw SQL, No ORM)

### Frontend
- React 18
- Tailwind CSS

### Database
- SQLite (`model_portfolio.db`)

---

## 📂 Project Structure

```bash
RebalancePro/
│
├── frontend/                 # React frontend
├── backend/                  # Express backend
├── model_portfolio.db        # SQLite database
├── package.json
└── README.md
```

---

## ⚙️ Quick Start

### 1️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Backend starts on:

```bash
http://localhost:5000
```

> Database is automatically created and seeded on first run.

---

### 2️⃣ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend starts on:

```bash
http://localhost:3000
```

The frontend `package.json` includes:

```json
"proxy": "http://localhost:5000"
```

So all `/api/*` requests are automatically forwarded to the backend.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/portfolio/rebalance` | Generate rebalancing recommendations |
| POST | `/api/portfolio/rebalance/save` | Save rebalance session |
| GET | `/api/portfolio/holdings` | Fetch current holdings |
| GET | `/api/portfolio/model` | Fetch model allocations |
| PUT | `/api/portfolio/model` | Update model allocations |
| GET | `/api/portfolio/history` | Fetch all rebalance sessions |
| GET | `/api/portfolio/history/:id` | Fetch session details |
| PATCH | `/api/portfolio/history/:id/status` | Update session status |

---

## 🧠 Rebalancing Algorithm

### Total Portfolio Value

```text
Total value = Sum of all holdings (including non-model funds)
```

### Current Allocation Percentage

```text
current_pct = (fund_value / total_value) × 100
```

### Drift Calculation

```text
drift = target_pct − current_pct
```

### Rebalancing Amount

```text
amount = |drift / 100 × total_value|
```

### Action Rules

| Condition | Action |
|---|---|
| drift > 0 | BUY |
| drift < 0 | SELL |
| drift = 0 | HOLD |
| Fund not in model | REVIEW |

### Net Cash Calculation

```text
net_cash_needed = total_to_buy − total_to_sell
```

---

## ⚠️ Edge Cases Handled

| Case | Behaviour |
|---|---|
| Fund in model but ₹0 invested | `current_pct = 0`, action = BUY |
| Fund in holdings but not in model | action = REVIEW |
| Model allocation ≠ 100% | API returns `422` |
| Perfect allocation | action = HOLD |
| SELL transactions | Stored as positive amounts with SELL label |
| Database writes | Wrapped in transactions |

---

## 📊 Seed Portfolio Data

### Client: Rajesh Kumar  
### Portfolio Value: ₹15,00,000

| Fund | Current Value | Target % | Recommendation |
|---|---|---|---|
| HDFC Nifty 50 Index Fund | ₹5,80,000 | 35% | SELL |
| Mirae Asset Large Cap Fund | ₹3,40,000 | 20% | SELL |
| HDFC Mid Cap Opportunities | ₹0 | 15% | BUY |
| Parag Parikh Flexi Cap Fund | ₹2,95,000 | 15% | SELL |
| ICICI Pru Short Term Debt Fund | ₹1,95,000 | 15% | BUY |

---

## 🧪 Edge Case Validation

The application properly handles:

- Missing model funds
- Over-allocated portfolios
- Under-allocated portfolios
- Zero-investment funds
- Non-model holdings
- Invalid allocation totals
- Transaction-safe DB operations

---

## 📈 Future Improvements

- Authentication & role-based access
- PDF portfolio reports
- Portfolio analytics dashboard
- Live mutual fund NAV integration
- Cloud deployment
- Docker support
- CI/CD integration
- Advanced portfolio optimization

---

## 👨‍💻 Author

**Raiyan Ali**

---

## 📄 License

This project is developed for learning and portfolio purposes.
