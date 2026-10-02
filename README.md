# Financial-Data-Dashboard — Professional Financial Dashboard

> A full-stack MERN portfolio tracker that solves what existing dashboards miss.

## What Makes Financial-Data-Dashboard Different

| Problem with existing tools | How FinPulse solves it |
|-----------------------------|------------------------|
| No risk metrics | Sharpe Ratio, Beta, Volatility per stock |
| No diversification alerts | Auto-warns if sector > 40% concentration |
| Static data, no refresh | Auto-refresh every 60s with live indicator |
| Price alerts buried or missing | Per-stock alerts stored in MongoDB |
| No AI insight panel | Claude AI summarises your portfolio health |
| Mobile UX is broken | Fully responsive, mobile-first layout |
| Can't see P&L over time | Daily snapshot history saved to MongoDB |

## Tech Stack

- **Frontend**: React 18, Recharts, Axios, CSS Variables
- **Backend**: Node.js, Express 4
- **Database**: MongoDB + Mongoose
- **APIs**: Alpha Vantage (stocks), Claude AI (insights)

## Project Structure

```
finpulse/
├── backend/
│   ├── controllers/
│   │   ├── stockController.js      # Alpha Vantage API calls
│   │   ├── portfolioController.js  # CRUD for holdings
│   │   ├── alertController.js      # Price alerts CRUD
│   │   └── insightController.js    # Claude AI summaries
│   ├── middleware/
│   │   └── errorHandler.js         # Global error handling
│   ├── models/
│   │   ├── Portfolio.js            # Holdings schema
│   │   ├── Alert.js                # Price alerts schema
│   │   └── Snapshot.js             # Daily P&L history schema
│   ├── routes/
│   │   ├── stockRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── alertRoutes.js
│   │   └── insightRoutes.js
│   ├── utils/
│   │   └── riskMetrics.js          # Sharpe, Beta, Volatility math
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── charts/             # All Recharts components
        │   ├── layout/             # Navbar, Sidebar, PageWrapper
        │   └── ui/                 # Cards, Badges, Buttons
        ├── context/
        │   └── PortfolioContext.jsx # Global state (React Context)
        ├── hooks/
        │   ├── usePortfolio.js
        │   ├── useAlerts.js
        │   └── useAutoRefresh.js
        ├── pages/
        │   ├── Dashboard.jsx       # Main overview
        │   ├── Portfolio.jsx       # Holdings table + risk
        │   ├── Watchlist.jsx       # Tracked stocks + alerts
        │   └── Insights.jsx        # AI analysis page
        ├── utils/
        │   └── formatters.js       # Currency, %, date helpers
        └── App.jsx
```

## Setup (Step by Step)

### 1. Prerequisites
```bash
node --version   # need v18+
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, ALPHA_VANTAGE_KEY, ANTHROPIC_API_KEY
npm run dev
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm start
```

### 4. Verify it works
- Backend health: http://localhost:5000/api/health
- Frontend: http://localhost:3000

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `MONGO_URI` | https://cloud.mongodb.com → Connect → Drivers |
| `ALPHA_VANTAGE_KEY` | https://www.alphavantage.co/support/#api-key (free) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `PORT` | Default: 5000 |

## GitHub Setup

```bash
git init
git add .
git commit -m "feat: initial FinPulse MERN dashboard"
git remote add origin https://github.com/YOUR_USERNAME/finpulse.git
git push -u origin main
```

⚠️ `.env` is in `.gitignore` — never commit real keys.
