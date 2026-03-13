// ============================================================
// models/Portfolio.js — Holdings schema
// ============================================================

const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    symbol:      { type: String, required: true, uppercase: true, trim: true, unique: true },
    companyName: { type: String, required: true },
    shares:      { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true, min: 0 },
    sector:      { type: String, default: "Other" },
    // Notes the user typed about why they bought this stock
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
