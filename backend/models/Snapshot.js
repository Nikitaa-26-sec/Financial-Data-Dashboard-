// ============================================================
// models/Snapshot.js — Daily portfolio value history
// ------------------------------------------------------------
// Each day at market close we save the total portfolio value.
// This powers the "Portfolio Value Over Time" line chart,
// which most dashboards don't have.
// ============================================================

const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema({
  date:         { type: Date, default: Date.now },
  totalValue:   { type: Number, required: true },
  totalCost:    { type: Number, required: true },
  totalGain:    { type: Number, required: true },
  gainPercent:  { type: Number, required: true },
  // Holdings snapshot (symbol: price at close)
  holdings: { type: Map, of: Number },
});

module.exports = mongoose.model("Snapshot", snapshotSchema);
