// pages/Watchlist.jsx
// Track any stock symbol + set price alerts stored in MongoDB.

import React, { useState } from "react";
import { usePortfolioContext } from "../context/PortfolioContext";
import { stockAPI } from "../utils/api";
import { Card, CardTitle, Empty, Spinner } from "../components/ui";
import { fmt, gainColor, arrow } from "../utils/formatters";

export default function Watchlist() {
  const { alerts, addAlert, removeAlert } = usePortfolioContext();

  const [symbol,    setSymbol]    = useState("");
  const [condition, setCondition] = useState("above");
  const [target,    setTarget]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [alertErr,  setAlertErr]  = useState("");

  // Quick-lookup state
  const [lookupSym,    setLookupSym]    = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [looking,      setLooking]      = useState(false);
  const [lookupErr,    setLookupErr]    = useState("");

  async function handleLookup() {
    if (!lookupSym.trim()) return;
    setLooking(true); setLookupErr(""); setLookupResult(null);
    try {
      const data = await stockAPI.quote(lookupSym.trim().toUpperCase());
      setLookupResult(data);
    } catch {
      setLookupErr(`Could not find symbol: ${lookupSym}`);
    } finally { setLooking(false); }
  }

  async function handleAddAlert(e) {
    e.preventDefault();
    if (!symbol || !target) { setAlertErr("Symbol and target price are required"); return; }
    setSaving(true); setAlertErr("");
    try {
      await addAlert({ symbol: symbol.toUpperCase(), condition, targetPrice: +target });
      setSymbol(""); setTarget("");
    } catch (err) {
      setAlertErr(err.response?.data?.error || "Failed to create alert");
    } finally { setSaving(false); }
  }

  const active    = alerts.filter(a => !a.triggered);
  const fired     = alerts.filter(a => a.triggered);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Quick Quote Lookup ── */}
      <Card>
        <CardTitle>Quick Quote Lookup</CardTitle>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            style={s.input}
            placeholder="Enter symbol (e.g. TSLA)"
            value={lookupSym}
            onChange={e => setLookupSym(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
          />
          <button style={s.primaryBtn} onClick={handleLookup} disabled={looking}>
            {looking ? "…" : "Look Up"}
          </button>
        </div>
        {lookupErr && <p style={{ color: "var(--red)", fontSize: 13 }}>{lookupErr}</p>}
        {lookupResult && (
          <div style={s.quoteResult}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>
                {lookupResult.symbol}
              </span>
              <span style={{ marginLeft: 10, fontSize: 13, color: "var(--muted)" }}>
                {lookupResult.source === "mock" ? "(mock data)" : ""}
              </span>
            </div>
            <div style={{ display: "flex", gap: 32, marginTop: 10, flexWrap: "wrap" }}>
              <div>
                <p style={s.ql}>Price</p>
                <p style={s.qv}>{fmt.currency(lookupResult.price)}</p>
              </div>
              <div>
                <p style={s.ql}>Change</p>
                <p style={{ ...s.qv, color: gainColor(lookupResult.change) }}>
                  {arrow(lookupResult.change)} {fmt.currency(Math.abs(lookupResult.change))} ({lookupResult.changePct})
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Set Price Alert ── */}
      <Card>
        <CardTitle>Set Price Alert</CardTitle>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          Alerts are checked every 60 seconds. You'll see a banner notification when one fires.
        </p>
        {alertErr && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{alertErr}</p>}
        <form onSubmit={handleAddAlert}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={s.field}>
              <label style={s.label}>Symbol</label>
              <input style={s.input} placeholder="AAPL" value={symbol}
                onChange={e => setSymbol(e.target.value.toUpperCase())} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Condition</label>
              <select style={s.input} value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="above">Price rises above</option>
                <option value="below">Price falls below</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Target Price ($)</label>
              <input style={s.input} type="number" placeholder="180.00" value={target}
                onChange={e => setTarget(e.target.value)} step="0.01" min="0" />
            </div>
            <button type="submit" style={s.primaryBtn} disabled={saving}>
              {saving ? "Saving…" : "+ Add Alert"}
            </button>
          </div>
        </form>
      </Card>

      {/* ── Active Alerts ── */}
      <Card>
        <CardTitle>Active Alerts ({active.length})</CardTitle>
        {active.length === 0
          ? <Empty icon="◎" message="No active alerts" sub="Add an alert above to start monitoring." />
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {active.map(a => (
                <div key={a._id} style={s.alertRow}>
                  <span style={{ fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)", minWidth: 60 }}>{a.symbol}</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>
                    Notify when price goes <strong style={{ color: "var(--text)" }}>{a.condition}</strong>{" "}
                    <strong style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>{fmt.currency(a.targetPrice)}</strong>
                  </span>
                  <div style={{ ...s.statusChip, background: "rgba(59,130,246,0.1)", color: "var(--accent)" }}>Watching</div>
                  <button style={s.removeBtn} onClick={() => removeAlert(a._id)}>✕</button>
                </div>
              ))}
            </div>
          )
        }
      </Card>

      {/* ── Triggered Alerts ── */}
      {fired.length > 0 && (
        <Card>
          <CardTitle>Triggered Alerts ({fired.length})</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fired.map(a => (
              <div key={a._id} style={{ ...s.alertRow, opacity: 0.7 }}>
                <span style={{ fontWeight: 700, color: "var(--muted)", fontFamily: "var(--mono)", minWidth: 60 }}>{a.symbol}</span>
                <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>
                  Hit {fmt.currency(a.triggeredPrice)} on {fmt.dateFull(a.triggeredAt)} (target: {a.condition} {fmt.currency(a.targetPrice)})
                </span>
                <div style={{ ...s.statusChip, background: "rgba(16,185,129,0.1)", color: "var(--green)" }}>✓ Fired</div>
                <button style={s.removeBtn} onClick={() => removeAlert(a._id)}>✕</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

const s = {
  input: {
    padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--text)", fontSize: 13, fontFamily: "var(--font)",
    outline: "none", minWidth: 130,
  },
  primaryBtn: {
    padding: "8px 18px", background: "var(--accent)", border: "none",
    borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 600,
    fontFamily: "var(--font)", cursor: "pointer", whiteSpace: "nowrap",
  },
  field:    { display: "flex", flexDirection: "column", gap: 5 },
  label:    { fontSize: 12, color: "var(--muted)", fontWeight: 500 },
  quoteResult: {
    background: "var(--surface2)", borderRadius: 8,
    padding: "14px 16px", border: "1px solid var(--border)",
  },
  ql: { fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 },
  qv: { fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--text)" },
  alertRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 14px", borderRadius: 8,
    background: "var(--surface2)", border: "1px solid var(--border)",
  },
  statusChip: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 },
  removeBtn: {
    background: "none", border: "none", color: "var(--muted)",
    cursor: "pointer", fontSize: 14, padding: "2px 6px",
  },
};
