// ============================================================
// models/Alert.js — Price alert schema
// ------------------------------------------------------------
// Users set alerts like "notify me when AAPL drops below $180"
// The backend checks these on every auto-refresh.
// ============================================================

const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    symbol:    { type: String, required: true, uppercase: true },
    // "above" = alert when price rises above target
    // "below" = alert when price falls below target
    condition: { type: String, enum: ["above", "below"], required: true },
    targetPrice: { type: Number, required: true, min: 0 },
    // true once the alert has been triggered (so it doesn't repeat)
    triggered: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: null },
    // The price when it was triggered
    triggeredPrice: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
