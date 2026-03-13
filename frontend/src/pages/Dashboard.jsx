// pages/Dashboard.jsx — main overview page
import React from "react";
import { usePortfolioContext } from "../context/PortfolioContext";
import { Card, CardTitle, StatTile, GainValue, Spinner, ErrorBox, Empty } from "../components/ui";
import PortfolioValueChart from "../components/charts/PortfolioValueChart";
import SectorPieChart from "../components/charts/SectorPieChart";
import { fmt, gainColor, arrow } from "../utils/formatters";

export default function Dashboard({ onNav }) {
  const { enriched, totals, loading, error } = usePortfolioContext();

  if (loading) return <Spinner />;
  if (error)   return <div style={{ padding: 24 }}><ErrorBox message={error} /></div>;
  if (enriched.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          icon="◈"
          message="Your portfolio is empty"
          sub='Go to the Portfolio tab and click "Add Stock" to get started.'
        />
      </div>
    );
  }

  // Top 3 performers today
  const topMovers = [...enriched]
    .filter(h => h.dailyChange != null)
    .sort((a, b) => Math.abs(b.dailyChange) - Math.abs(a.dailyChange))
    .slice(0, 4);

  return (
    <div style={s.page}>
      {/* ── KPI row ── */}
      <div style={s.kpiRow}>
        <Card style={s.kpiCard}>
          <StatTile
            label="Total Value"
            value={fmt.currency(totals.value)}
            sub={`${enriched.length} positions`}
          />
        </Card>
        <Card style={s.kpiCard}>
          <StatTile
            label="Total Gain / Loss"
            value={fmt.currencySigned(totals.gain)}
            sub={fmt.percent(totals.gainPct)}
            subColor={gainColor(totals.gain)}
          />
        </Card>
        <Card style={s.kpiCard}>
          <StatTile
            label="Cost Basis"
            value={fmt.currency(totals.cost)}
            sub="Amount invested"
          />
        </Card>
        <Card style={s.kpiCard}>
          <StatTile
            label="Day's Change"
            value={fmt.currencySigned(
              enriched.reduce((a, h) => a + (h.dailyChange || 0) * h.shares, 0)
            )}
            sub="Across all positions"
            subColor={gainColor(enriched.reduce((a, h) => a + (h.dailyChange || 0) * h.shares, 0))}
          />
        </Card>
      </div>

      {/* ── Charts row ── */}
      <div style={s.chartsRow}>
        <Card style={{ flex: 2 }}>
          <PortfolioValueChart />
        </Card>
        <Card style={{ flex: 1 }}>
          <SectorPieChart />
        </Card>
      </div>

      {/* ── Top movers ── */}
      <Card>
        <CardTitle>Top Movers Today</CardTitle>
        <div style={s.moversGrid}>
          {topMovers.map(h => (
            <div key={h.symbol} style={s.moverCard}>
              <div style={s.moverTop}>
                <span style={s.moverSymbol}>{h.symbol}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{h.sector}</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--mono)", margin: "6px 0 2px" }}>
                {fmt.currency(h.price)}
              </p>
              <p style={{ fontSize: 13, color: gainColor(h.dailyChange), fontWeight: 600 }}>
                {arrow(h.dailyChange)} {fmt.currency(Math.abs(h.dailyChange))} ({h.dailyChangePct})
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const s = {
  page:      { display: "flex", flexDirection: "column", gap: 20, padding: 24 },
  kpiRow:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  kpiCard:   { padding: "20px 24px" },
  chartsRow: { display: "flex", gap: 16 },
  moversGrid:{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginTop: 4 },
  moverCard: {
    background: "var(--surface2)", borderRadius: 10,
    padding: "14px 16px", border: "1px solid var(--border)",
  },
  moverTop:   { display: "flex", justifyContent: "space-between", alignItems: "center" },
  moverSymbol:{ fontSize: 15, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" },
};
