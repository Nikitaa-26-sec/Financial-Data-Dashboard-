// ============================================================
// controllers/alertController.js
// ------------------------------------------------------------
// CRUD for price alerts.
// checkAlerts() is called by the frontend on each auto-refresh.
// ============================================================

const Alert = require("../models/Alert");
const axios = require("axios");

const AV_BASE = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_KEY;
const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !API_KEY || API_KEY === "YOUR_KEY_HERE";

const MOCK_PRICES = {
  AAPL:189.84, MSFT:414.20, GOOGL:174.90, AMZN:198.60,
  JPM:204.50,  NVDA:875.40, TSLA:178.20,  META:512.30,
};

// ── GET /api/alerts ──────────────────────────────────────────
async function getAllAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({}).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) { next(err); }
}

// ── POST /api/alerts ─────────────────────────────────────────
async function createAlert(req, res, next) {
  try {
    const { symbol, condition, targetPrice } = req.body;
    if (!symbol || !condition || !targetPrice) {
      return res.status(400).json({ error: "symbol, condition, and targetPrice are required" });
    }
    const alert = await Alert.create({ symbol, condition, targetPrice: +targetPrice });
    res.status(201).json(alert);
  } catch (err) { next(err); }
}

// ── DELETE /api/alerts/:id ───────────────────────────────────
async function deleteAlert(req, res, next) {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Alert not found" });
    res.json({ message: "Alert deleted" });
  } catch (err) { next(err); }
}

// ── POST /api/alerts/check ───────────────────────────────────
// Checks all active alerts against current prices
// Returns list of newly triggered alerts so frontend can notify
async function checkAlerts(req, res, next) {
  try {
    const activeAlerts = await Alert.find({ triggered: false });
    const triggered    = [];

    for (const alert of activeAlerts) {
      let price;
      if (USE_MOCK) {
        price = MOCK_PRICES[alert.symbol] || null;
      } else {
        const { data } = await axios.get(AV_BASE, {
          params: { function: "GLOBAL_QUOTE", symbol: alert.symbol, apikey: API_KEY },
        });
        price = parseFloat(data["Global Quote"]?.["05. price"]);
      }

      if (!price) continue;

      const hit =
        (alert.condition === "above" && price >= alert.targetPrice) ||
        (alert.condition === "below" && price <= alert.targetPrice);

      if (hit) {
        alert.triggered      = true;
        alert.triggeredAt    = new Date();
        alert.triggeredPrice = price;
        await alert.save();
        triggered.push(alert);
      }
    }

    res.json({ triggered, checkedCount: activeAlerts.length });
  } catch (err) { next(err); }
}

module.exports = { getAllAlerts, createAlert, deleteAlert, checkAlerts };
