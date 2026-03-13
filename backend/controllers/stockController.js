// ============================================================
// controllers/stockController.js
// ------------------------------------------------------------
// Fetches live quotes and price history from Alpha Vantage.
// Attaches risk metrics (volatility, Sharpe, Beta) to history.
// Falls back to realistic mock data when API key is missing.
// ============================================================

const axios        = require("axios");
const { calcAllMetrics } = require("../utils/riskMetrics");

const AV_BASE = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_KEY;
const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !API_KEY || API_KEY === "YOUR_KEY_HERE";

// ── Static mock data ─────────────────────────────────────────
const MOCK_QUOTES = {
  AAPL:  { price: 189.84, change: +1.20, changePct: "+0.64%" },
  MSFT:  { price: 414.20, change: +3.10, changePct: "+0.75%" },
  GOOGL: { price: 174.90, change: -0.80, changePct: "-0.46%" },
  AMZN:  { price: 198.60, change: +2.20, changePct: "+1.12%" },
  JPM:   { price: 204.50, change: +0.90, changePct: "+0.44%" },
  NVDA:  { price: 875.40, change: +12.5, changePct: "+1.45%" },
  TSLA:  { price: 178.20, change: -3.40, changePct: "-1.87%" },
  META:  { price: 512.30, change: +5.60, changePct: "+1.11%" },
};

// S&P 500 proxy for Beta calculation (30 days of mock returns)
const MOCK_SPY_PRICES = [
  490,492,491,495,497,496,498,500,499,502,
  503,501,504,506,505,507,509,508,511,510,
  512,514,513,515,517,516,518,520,519,521,
];

function generateMockHistory(symbol) {
  const starts = { AAPL:175, MSFT:390, GOOGL:160, AMZN:182, JPM:193, NVDA:800, TSLA:190, META:480 };
  const start  = starts[symbol] || 100;
  const prices = [];
  let prev     = start;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    prev = parseFloat((prev * (1 + (Math.random() - 0.48) * 0.022)).toFixed(2));
    prices.push({ date: date.toISOString().split("T")[0], close: prev });
  }
  return prices;
}

// ── GET /api/stocks/quote/:symbol ────────────────────────────
async function getQuote(req, res, next) {
  const { symbol } = req.params;
  try {
    if (USE_MOCK) {
      const mock = MOCK_QUOTES[symbol.toUpperCase()];
      if (!mock) return res.status(404).json({ error: `No data for ${symbol}` });
      return res.json({ symbol: symbol.toUpperCase(), ...mock, source: "mock" });
    }

    const { data } = await axios.get(AV_BASE, {
      params: { function: "GLOBAL_QUOTE", symbol, apikey: API_KEY },
    });

    const q = data["Global Quote"];
    if (!q || !q["05. price"]) {
      return res.status(404).json({ error: `Symbol not found: ${symbol}` });
    }

    res.json({
      symbol:    q["01. symbol"],
      price:     parseFloat(q["05. price"]),
      change:    parseFloat(q["09. change"]),
      changePct: q["10. change percent"],
      volume:    parseInt(q["06. volume"]),
      high:      parseFloat(q["03. high"]),
      low:       parseFloat(q["04. low"]),
      source:    "alphavantage",
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/stocks/history/:symbol ─────────────────────────
// Returns 30-day history + risk metrics
async function getHistory(req, res, next) {
  const { symbol } = req.params;
  try {
    let history;

    if (USE_MOCK) {
      history = generateMockHistory(symbol.toUpperCase());
    } else {
      const { data } = await axios.get(AV_BASE, {
        params: {
          function:   "TIME_SERIES_DAILY",
          symbol,
          outputsize: "compact",
          apikey:     API_KEY,
        },
      });

      const ts = data["Time Series (Daily)"];
      if (!ts) return res.status(404).json({ error: `No history for ${symbol}` });

      history = Object.entries(ts)
        .slice(0, 30)
        .reverse()
        .map(([date, v]) => ({ date, close: parseFloat(v["4. close"]) }));
    }

    // Attach risk metrics
    const closingPrices = history.map((d) => d.close);
    const metrics       = calcAllMetrics(closingPrices, MOCK_SPY_PRICES);

    res.json({ symbol: symbol.toUpperCase(), history, metrics });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/stocks/search/:query ────────────────────────────
// Simple symbol search (Alpha Vantage SYMBOL_SEARCH)
async function searchSymbol(req, res, next) {
  const { query } = req.params;
  try {
    if (USE_MOCK) {
      // Return filtered mock results
      const all = Object.keys(MOCK_QUOTES).filter((s) =>
        s.includes(query.toUpperCase())
      );
      return res.json(all.map((s) => ({ symbol: s, name: s })));
    }

    const { data } = await axios.get(AV_BASE, {
      params: { function: "SYMBOL_SEARCH", keywords: query, apikey: API_KEY },
    });

    const results = (data.bestMatches || []).slice(0, 8).map((m) => ({
      symbol: m["1. symbol"],
      name:   m["2. name"],
      region: m["4. region"],
    }));

    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuote, getHistory, searchSymbol };
