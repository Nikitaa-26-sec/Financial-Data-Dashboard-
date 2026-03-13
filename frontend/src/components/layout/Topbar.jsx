// components/layout/Topbar.jsx
import React from "react";
import { usePortfolioContext } from "../../context/PortfolioContext";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  portfolio: "Portfolio",
  watchlist: "Watchlist",
  insights:  "AI Insights",
};

export default function Topbar({ activePage }) {
  const { lastUpdate, refresh, loading, triggered, dismissTriggered } = usePortfolioContext();

  return (
    <>
      {/* Alert banner */}
      {triggered.length > 0 && (
        <div style={s.alertBanner}>
          <span>🔔</span>
          <span style={{ flex: 1 }}>
            <strong>Price Alert Triggered:</strong>{" "}
            {triggered.map(a =>
              `${a.symbol} hit $${a.triggeredPrice?.toFixed(2)} (target: ${a.condition} $${a.targetPrice})`
            ).join(" · ")}
          </span>
          <button style={s.dismissBtn} onClick={dismissTriggered}>✕</button>
        </div>
      )}

      {/* Main topbar */}
      <header style={s.bar}>
        <h1 style={s.title}>{PAGE_TITLES[activePage]}</h1>

        <div style={s.right}>
          {lastUpdate && (
            <span style={s.updated}>
              Updated {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} onClick={refresh} disabled={loading}>
            {loading ? "↻" : "↻ Refresh"}
          </button>
        </div>
      </header>
    </>
  );
}

const s = {
  alertBanner: {
    background: "rgba(245,158,11,0.15)",
    border: "1px solid rgba(245,158,11,0.4)",
    borderRadius: 8,
    padding: "10px 16px",
    margin: "16px 24px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--yellow)",
  },
  dismissBtn: {
    background: "none", border: "none",
    color: "var(--yellow)", cursor: "pointer", fontSize: 14,
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid var(--border)",
  },
  title: { fontSize: 20, fontWeight: 600, color: "var(--text)" },
  right: { display: "flex", alignItems: "center", gap: 14 },
  updated: { fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" },
  btn: {
    padding: "7px 14px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 7,
    color: "var(--accent)",
    fontSize: 13,
    fontFamily: "var(--font)",
    cursor: "pointer",
  },
  btnLoading: { opacity: 0.5, cursor: "not-allowed" },
};
