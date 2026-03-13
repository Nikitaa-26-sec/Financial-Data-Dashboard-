// ============================================================
// controllers/insightController.js
// ------------------------------------------------------------
// Sends portfolio data to Claude AI and gets back a
// professional analysis: diversification, risk, recommendations.
// This is the feature most dashboards completely lack.
// ============================================================

const axios     = require("axios");
const Portfolio = require("../models/Portfolio");

const MOCK_PRICES = {
  AAPL:189.84, MSFT:414.20, GOOGL:174.90, AMZN:198.60,
  JPM:204.50,  NVDA:875.40, TSLA:178.20,  META:512.30,
};

// ── POST /api/insights/analyze ───────────────────────────────
async function analyzePortfolio(req, res, next) {
  try {
    const holdings = await Portfolio.find({});

    if (holdings.length === 0) {
      return res.json({ insight: "Add some stocks to your portfolio first to get AI analysis." });
    }

    // Build a summary of the portfolio for Claude to analyze
    const summary = holdings.map((h) => {
      const price       = MOCK_PRICES[h.symbol] || h.avgBuyPrice;
      const currentVal  = price * h.shares;
      const cost        = h.avgBuyPrice * h.shares;
      const gainPct     = (((currentVal - cost) / cost) * 100).toFixed(1);
      return `${h.symbol} (${h.sector}): ${h.shares} shares @ avg $${h.avgBuyPrice}, current $${price}, gain ${gainPct}%`;
    }).join("\n");

    // Sector concentration
    const sectorMap = {};
    let totalValue  = 0;
    holdings.forEach((h) => {
      const val = (MOCK_PRICES[h.symbol] || h.avgBuyPrice) * h.shares;
      sectorMap[h.sector] = (sectorMap[h.sector] || 0) + val;
      totalValue += val;
    });
    const sectorSummary = Object.entries(sectorMap)
      .map(([s, v]) => `${s}: ${((v / totalValue) * 100).toFixed(1)}%`)
      .join(", ");

    const prompt = `You are a professional financial analyst reviewing a retail investor's stock portfolio.

Portfolio Holdings:
${summary}

Sector Allocation:
${sectorSummary}

Total Portfolio Value: $${totalValue.toFixed(2)}

Please provide a concise, professional analysis covering:
1. **Diversification Assessment** — Is the portfolio well-diversified? Any concentration risks?
2. **Risk Profile** — Overall risk level (conservative/moderate/aggressive) based on holdings
3. **Top Strength** — The biggest advantage of this portfolio
4. **Main Concern** — The most important risk or weakness to address
5. **One Action** — A single specific recommendation (e.g., rebalance X, consider adding Y sector)

Keep the tone professional but accessible. Be specific, not generic. Total response: 150-200 words.`;

    // Call Claude API
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key":         process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type":      "application/json",
        },
      }
    );

    const insight = response.data.content[0].text;
    res.json({ insight });
  } catch (err) {
    // If AI call fails, return a useful fallback
    console.error("AI insight error:", err.message);
    res.json({
      insight: "AI analysis unavailable. Check that ANTHROPIC_API_KEY is set in your .env file.",
    });
  }
}

module.exports = { analyzePortfolio };
