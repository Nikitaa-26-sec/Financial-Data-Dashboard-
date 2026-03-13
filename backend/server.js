// ============================================================
// server.js — FinPulse backend entry point
// ============================================================
// Boot order:
//   1. Load env variables
//   2. Connect to MongoDB
//   3. Register middleware (cors, json parsing)
//   4. Mount all route groups
//   5. Global error handler
//   6. Start listening
// ============================================================

require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const cron     = require("node-cron");

const stockRoutes     = require("./routes/stockRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const alertRoutes     = require("./routes/alertRoutes");
const insightRoutes   = require("./routes/insightRoutes");
const errorHandler    = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Log every incoming request in dev (helpful for debugging)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── MongoDB Connection ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("   → Running without database (some features disabled)");
  });

// ── API Routes ───────────────────────────────────────────────
app.use("/api/stocks",    stockRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/alerts",    alertRoutes);
app.use("/api/insights",  insightRoutes);

// Health check — useful for uptime monitors and Render/Railway deploys
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "FinPulse API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── Daily snapshot cron job ──────────────────────────────────
// Runs every day at 4:30 PM EST (market close) to save portfolio value
// "30 21 * * 1-5" = 21:30 UTC = 4:30 PM EST, weekdays only
cron.schedule("30 21 * * 1-5", async () => {
  try {
    const { savePortfolioSnapshot } = require("./controllers/portfolioController");
    await savePortfolioSnapshot();
    console.log("📸 Daily portfolio snapshot saved");
  } catch (err) {
    console.error("Snapshot job failed:", err.message);
  }
});

// ── Global error handler (must be last) ─────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FinPulse API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
