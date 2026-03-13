// pages/Insights.jsx
// Sends portfolio to Claude AI and displays a professional analysis.

import React, { useState } from "react";
import { insightAPI } from "../utils/api";
import { usePortfolioContext } from "../context/PortfolioContext";
import { Card, CardTitle, Spinner, Empty } from "../components/ui";
import { fmt, gainColor, SECTOR_COLORS } from "../utils/formatters";

export default function Insights() {
  const { enriched, totals, sectors, loading } = usePortfolioContext();
  const [insight,     setInsight]     = useState("");
  const [analyzing,   setAnalyzing]   = useState(false);
  const [analyzed,    setAnalyzed]    = useState(false);
  const [error,       setError]       = useState("");

  if (loading) return <Spinner />;

  async function runAnalysis() {
    setAnalyzing(true); setError(""); setInsight("");
    try {
      const result = await insightAPI.analyze();
      setInsight(result.insight);
      setAnalyzed(true);
    } catch {
      setError("Analysis failed. Check that your Anthropic API key is set in backend/.env");
    } finally { setAnalyzing(false); }
  }

  // Format the AI insight text with simple markdown-like rendering
  function renderInsight(text) {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} style={{ marginBottom: 8, lineHeight: 1.7 }}>
          {parts.map((p, j) => j % 2 === 1
            ? <strong key={j} style={{ color: "var(--text)", fontWeight: 600 }}>{p}</strong>
            : <span key={j}>{p}</span>
          )}
        </p>
      );
    });
  }

  // Portfolio stats for the summary panel
  const topGainer = [...enriched].sort((a, b) => b.gainPercent - a.gainPercent)[0];
  const topLoser  = [...enriched].sort((a, b) => a.gainPercent - b.gainPercent)[0];
  const sectorArr = Object.entries(sectors)
    .sort((a, b) => b[1] - a[1])
    .map(([name, val]) => ({ name, val, pct: totals.value > 0 ? (val / totals.value) * 100 : 0 }));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stats summary ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card>
          <CardTitle>Best Performer</CardTitle>
          {topGainer ? (
            <>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>{topGainer.symbol}</p>
              <p style={{ fontSize: 14, color: "var(--green)", marginTop: 4 }}>+{topGainer.gainPercent.toFixed(2)}%</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{topGainer.companyName}</p>
            </>
          ) : <p style={{ color: "var(--muted)", fontSize: 13 }}>No data</p>}
        </Card>
        <Card>
          <CardTitle>Weakest Performer</CardTitle>
          {topLoser ? (
            <>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>{topLoser.symbol}</p>
              <p style={{ fontSize: 14, color: gainColor(topLoser.gainPercent), marginTop: 4 }}>
                {topLoser.gainPercent >= 0 ? "+" : ""}{topLoser.gainPercent.toFixed(2)}%
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{topLoser.companyName}</p>
            </>
          ) : <p style={{ color: "var(--muted)", fontSize: 13 }}>No data</p>}
        </Card>
        <Card>
          <CardTitle>Portfolio Health</CardTitle>
          <p style={{ fontSize: 20, fontWeight: 700, color: gainColor(totals.gain), fontFamily: "var(--mono)" }}>
            {totals.gain >= 0 ? "+" : ""}{totals.gainPct.toFixed(2)}%
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {enriched.length} positions · {Object.keys(sectors).length} sectors
          </p>
        </Card>
      </div>

      {/* ── Sector breakdown ── */}
      <Card>
        <CardTitle>Sector Breakdown</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sectorArr.map(({ name, val, pct }) => (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: "var(--text)" }}>{name}</span>
                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>
                  {fmt.currency(val)} · {pct.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: SECTOR_COLORS[name] || SECTOR_COLORS.Other,
                  borderRadius: 3, transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── AI Analysis ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <CardTitle>AI Portfolio Analysis</CardTitle>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Powered by Claude AI · Analyses diversification, risk, and gives one actionable recommendation
            </p>
          </div>
          <button
            style={{
              padding: "9px 20px", background: analyzing ? "var(--surface2)" : "var(--accent)",
              border: "none", borderRadius: 8, color: analyzing ? "var(--muted)" : "#fff",
              fontSize: 13, fontWeight: 600, fontFamily: "var(--font)", cursor: analyzing ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
            onClick={runAnalysis}
            disabled={analyzing || enriched.length === 0}
          >
            {analyzing ? "Analysing…" : analyzed ? "Re-analyse" : "✦ Analyse Portfolio"}
          </button>
        </div>

        {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}

        {enriched.length === 0 && !analyzing && (
          <Empty icon="✦" message="No portfolio data" sub="Add stocks in the Portfolio tab first." />
        )}

        {analyzing && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 14, padding: "20px 0" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "2px solid var(--border)", borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
            }} />
            Sending portfolio to Claude AI…
          </div>
        )}

        {insight && !analyzing && (
          <div style={{
            background: "var(--surface2)", borderRadius: 10,
            padding: "18px 20px", borderLeft: "3px solid var(--accent)",
            color: "var(--muted)", fontSize: 14, lineHeight: 1.7,
          }}>
            {renderInsight(insight)}
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          ⚠ AI insights are for informational purposes only. This is not financial advice.
        </p>
      </Card>
    </div>
  );
}
