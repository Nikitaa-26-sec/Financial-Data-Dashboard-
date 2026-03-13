// ============================================================
// controllers/portfolioController.js
// ------------------------------------------------------------
// Full CRUD for portfolio holdings.
// Also handles the daily P&L snapshot job.
// ============================================================

const Portfolio = require("../models/Portfolio");
const Snapshot  = require("../models/Snapshot");
const axios     = require("axios");

const AV_BASE = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_KEY;
const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !API_KEY || API_KEY === "YOUR_KEY_HERE";

const MOCK_PRICES = {
  AAPL:189.84, MSFT:414.20, GOOGL:174.90, AMZN:198.60,
  JPM:204.50,  NVDA:875.40, TSLA:178.20,  META:512.30,
};

// ── GET /api/portfolio ───────────────────────────────────────
async function getAllHoldings(req, res, next) {
  try {
    const holdings = await Portfolio.find({}).sort({ createdAt: -1 });
    res.json(holdings);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/portfolio ──────────────────────────────────────
async function addHolding(req, res, next) {
  try {
    const { symbol, companyName, shares, avgBuyPrice, sector, notes } = req.body;

    if (!symbol || !companyName || !shares || !avgBuyPrice) {
      return res.status(400).json({ error: "symbol, companyName, shares, and avgBuyPrice are required" });
    }

    const holding = new Portfolio({ symbol, companyName, shares: +shares, avgBuyPrice: +avgBuyPrice, sector, notes });
    const saved   = await holding.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/portfolio/:id ───────────────────────────────────
async function updateHolding(req, res, next) {
  try {
    const updated = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Holding not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/portfolio/:id ────────────────────────────────
async function deleteHolding(req, res, next) {
  try {
    const deleted = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Holding not found" });
    res.json({ message: `${deleted.symbol} removed` });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/portfolio/snapshots ─────────────────────────────
// Returns the last 90 days of daily portfolio value snapshots
async function getSnapshots(req, res, next) {
  try {
    const snapshots = await Snapshot.find({})
      .sort({ date: -1 })
      .limit(90);
    res.json(snapshots.reverse()); // oldest → newest for chart
  } catch (err) {
    next(err);
  }
}

// ── Called by cron job in server.js ─────────────────────────
async function savePortfolioSnapshot() {
  const holdings = await Portfolio.find({});
  if (holdings.length === 0) return;

  let totalValue = 0;
  let totalCost  = 0;
  const priceMap = {};

  for (const h of holdings) {
    let price;
    if (USE_MOCK) {
      price = MOCK_PRICES[h.symbol] || h.avgBuyPrice;
    } else {
      const { data } = await axios.get(AV_BASE, {
        params: { function: "GLOBAL_QUOTE", symbol: h.symbol, apikey: API_KEY },
      });
      price = parseFloat(data["Global Quote"]?.["05. price"] || h.avgBuyPrice);
    }
    priceMap[h.symbol] = price;
    totalValue += price * h.shares;
    totalCost  += h.avgBuyPrice * h.shares;
  }

  const totalGain   = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  await Snapshot.create({ totalValue, totalCost, totalGain, gainPercent, holdings: priceMap });
}

module.exports = { getAllHoldings, addHolding, updateHolding, deleteHolding, getSnapshots, savePortfolioSnapshot };
