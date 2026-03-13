// components/ui/index.jsx — shared UI primitives

import React from "react";
import { gainColor } from "../../utils/formatters";

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section title inside a card ───────────────────────────────
export function CardTitle({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
      {children}
    </p>
  );
}

// ── KPI stat tile ─────────────────────────────────────────────
export function StatTile({ label, value, sub, subColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", fontFamily: "var(--mono)", letterSpacing: "-1px" }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: subColor || "var(--muted)" }}>{sub}</p>
      )}
    </div>
  );
}

// ── Gain / loss coloured value ────────────────────────────────
export function GainValue({ value, formatted }) {
  return (
    <span style={{ color: gainColor(value), fontWeight: 600, fontFamily: "var(--mono)" }}>
      {value >= 0 ? "+" : ""}{formatted}
    </span>
  );
}

// ── Risk badge ────────────────────────────────────────────────
const RISK_COLORS = {
  Low:       { bg: "rgba(16,185,129,0.12)",  fg: "#10b981" },
  Moderate:  { bg: "rgba(245,158,11,0.12)",  fg: "#f59e0b" },
  High:      { bg: "rgba(239,68,68,0.12)",   fg: "#ef4444" },
  "Very High":{ bg: "rgba(239,68,68,0.2)",   fg: "#ef4444" },
  Unknown:   { bg: "rgba(100,116,139,0.12)", fg: "#64748b" },
};

export function RiskBadge({ label }) {
  const c = RISK_COLORS[label] || RISK_COLORS.Unknown;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg,
    }}>
      {label}
    </span>
  );
}

// ── Sector badge ──────────────────────────────────────────────
export function SectorBadge({ sector }) {
  const colors = {
    Technology: "#3b82f6", Finance: "#8b5cf6", Healthcare: "#10b981",
    Consumer: "#f59e0b", Energy: "#ef4444", Other: "#64748b",
  };
  const c = colors[sector] || colors.Other;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: `${c}20`, color: c,
    }}>
      {sector}
    </span>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 60, gap: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "var(--accent)",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading portfolio…</p>
    </div>
  );
}

// ── Error message ─────────────────────────────────────────────
export function ErrorBox({ message }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 10, padding: "16px 20px",
      color: "#ef4444", fontSize: 14,
    }}>
      ❌ {message}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────
export function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0" }} />;
}

// ── Empty state ───────────────────────────────────────────────
export function Empty({ icon, message, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{message}</p>
      {sub && <p style={{ fontSize: 13 }}>{sub}</p>}
    </div>
  );
}
