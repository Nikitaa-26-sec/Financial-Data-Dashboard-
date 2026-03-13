// pages/Portfolio.jsx
import React, { useState } from "react";
import { usePortfolioContext } from "../context/PortfolioContext";
import { Card, CardTitle, Spinner, ErrorBox, Empty, RiskBadge, SectorBadge, GainValue } from "../components/ui";
import StockMiniChart from "../components/charts/StockMiniChart";
import { fmt, gainColor, arrow } from "../utils/formatters";

const SECTORS = ["Technology", "Finance", "Healthcare", "Consumer", "Energy", "Industrials", "Other"];

function AddStockForm({ onAdd, onClose }) {
  const [form, setForm]       = useState({ symbol: "", companyName: "", shares: "", avgBuyPrice: "", sector: "Technology", notes: "" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.symbol || !form.companyName || !form.shares || !form.avgBuyPrice) {
      setError("All fields except Notes are required"); return;
    }
    setSaving(true); setError("");
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add stock");
    } finally { setSaving(false); }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Add Stock</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={submit}>
          <div style={s.formGrid}>
            {[
              { label: "Ticker Symbol", key: "symbol",      placeholder: "e.g. AAPL" },
              { label: "Company Name",  key: "companyName", placeholder: "e.g. Apple Inc." },
              { label: "Shares",        key: "shares",      placeholder: "e.g. 10",    type: "number" },
              { label: "Avg Buy Price", key: "avgBuyPrice", placeholder: "e.g. 150.00",type: "number" },
            ].map(f => (
              <div key={f.key} style={s.formField}>
                <label style={s.label}>{f.label}</label>
                <input
                  style={s.input}
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                />
              </div>
            ))}

            <div style={s.formField}>
              <label style={s.label}>Sector</label>
              <select style={s.input} value={form.sector} onChange={e => set("sector", e.target.value)}>
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={s.formField}>
              <label style={s.label}>Notes (optional)</label>
              <input style={s.input} placeholder="Why you bought this…" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={saving}>
              {saving ? "Adding…" : "Add to Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { enriched, loading, error, addHolding, removeHolding } = usePortfolioContext();
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey]   = useState("gainPercent");
  const [sortDir, setSortDir]   = useState(-1); // -1 desc, +1 asc

  if (loading) return <Spinner />;
  if (error)   return <div style={{ padding: 24 }}><ErrorBox message={error} /></div>;

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  const sorted = [...enriched].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity;
    const bv = b[sortKey] ?? -Infinity;
    return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
  });

  function Th({ col, label }) {
    const active = sortKey === col;
    return (
      <th style={{ ...s.th, color: active ? "var(--accent)" : "var(--muted)", cursor: "pointer" }}
          onClick={() => toggleSort(col)}>
        {label} {active ? (sortDir === -1 ? "↓" : "↑") : ""}
      </th>
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {showForm && <AddStockForm onAdd={addHolding} onClose={() => setShowForm(false)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{enriched.length} position{enriched.length !== 1 ? "s" : ""}</p>
        <button style={s.addBtn} onClick={() => setShowForm(true)}>+ Add Stock</button>
      </div>

      {enriched.length === 0
        ? <Empty icon="◈" message="No holdings yet" sub='Click "Add Stock" to build your portfolio.' />
        : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <Th col="symbol"      label="Symbol" />
                    <th style={s.th}>Sector</th>
                    <Th col="price"       label="Price" />
                    <Th col="dailyChange" label="Day" />
                    <th style={s.th}>Shares</th>
                    <Th col="currentValue" label="Value" />
                    <Th col="gainDollars"  label="Gain $" />
                    <Th col="gainPercent"  label="Gain %" />
                    <th style={s.th}>Trend</th>
                    <th style={s.th}>Volatility</th>
                    <th style={s.th}>Sharpe</th>
                    <th style={s.th}>Beta</th>
                    <th style={s.th}>Risk</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(h => (
                    <tr key={h._id} style={s.tr}>
                      <td style={s.td}>
                        <div>
                          <span style={{ fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>{h.symbol}</span>
                          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{h.companyName}</p>
                        </div>
                      </td>
                      <td style={s.td}><SectorBadge sector={h.sector} /></td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)" }}>{fmt.currency(h.price)}</td>
                      <td style={{ ...s.td, color: gainColor(h.dailyChange), fontFamily: "var(--mono)", fontSize: 12 }}>
                        {h.dailyChange != null ? `${arrow(h.dailyChange)} ${fmt.currency(Math.abs(h.dailyChange))}` : "—"}
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)" }}>{h.shares}</td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)" }}>{fmt.currency(h.currentValue)}</td>
                      <td style={s.td}>
                        <GainValue value={h.gainDollars} formatted={fmt.currency(Math.abs(h.gainDollars))} />
                      </td>
                      <td style={s.td}>
                        <GainValue value={h.gainPercent} formatted={`${Math.abs(h.gainPercent).toFixed(2)}%`} />
                      </td>
                      <td style={s.td}>
                        <StockMiniChart history={h.history} gainDollars={h.gainDollars} />
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)", fontSize: 12 }}>
                        {h.metrics?.volatility != null ? `${h.metrics.volatility}%` : "—"}
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)", fontSize: 12, color: (() => {
                        const v = h.metrics?.sharpeRatio;
                        if (v == null) return "var(--muted)";
                        return v >= 1 ? "var(--green)" : v >= 0 ? "var(--yellow)" : "var(--red)";
                      })() }}>
                        {h.metrics?.sharpeRatio ?? "—"}
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--mono)", fontSize: 12 }}>
                        {h.metrics?.beta ?? "—"}
                      </td>
                      <td style={s.td}><RiskBadge label={h.metrics?.riskLabel || "Unknown"} /></td>
                      <td style={s.td}>
                        <button
                          style={s.removeBtn}
                          onClick={() => window.confirm(`Remove ${h.symbol}?`) && removeHolding(h._id)}
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }

      {/* Risk legend */}
      <Card>
        <CardTitle>Risk Metrics Guide</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          <div><strong style={{ color: "var(--text)" }}>Volatility</strong><br />Annualised std deviation of daily returns. &lt;15% = Low, 15–30% = Moderate, &gt;30% = High.</div>
          <div><strong style={{ color: "var(--text)" }}>Sharpe Ratio</strong><br />Return per unit of risk vs. 5.25% risk-free rate. &gt;1 = Good, &gt;2 = Excellent, &lt;0 = Underperforming.</div>
          <div><strong style={{ color: "var(--text)" }}>Beta</strong><br />Sensitivity vs. S&P 500. 1.0 = moves with market. &gt;1 = amplified swings. &lt;1 = defensive.</div>
        </div>
      </Card>
    </div>
  );
}

const s = {
  addBtn: {
    padding: "8px 18px", background: "var(--accent)", border: "none",
    borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600,
    fontFamily: "var(--font)", cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead: { background: "var(--surface2)" },
  th: {
    padding: "11px 14px", textAlign: "left", fontSize: 11,
    textTransform: "uppercase", letterSpacing: "0.06em",
    color: "var(--muted)", whiteSpace: "nowrap", fontWeight: 600,
    borderBottom: "1px solid var(--border)",
  },
  tr: { borderBottom: "1px solid var(--border)", transition: "background 0.1s" },
  td: { padding: "12px 14px", color: "var(--text)", verticalAlign: "middle" },
  removeBtn: {
    background: "none", border: "none", color: "var(--muted)",
    cursor: "pointer", fontSize: 14, padding: "2px 6px",
    borderRadius: 4,
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modal: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 14, padding: 28, width: 520, maxWidth: "95vw",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  closeBtn: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  formField: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, color: "var(--muted)", fontWeight: 500 },
  input: {
    padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--text)", fontSize: 13, fontFamily: "var(--font)", outline: "none",
  },
  cancelBtn: {
    padding: "8px 18px", background: "transparent", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--muted)", fontSize: 13, fontFamily: "var(--font)", cursor: "pointer",
  },
  submitBtn: {
    padding: "8px 20px", background: "var(--accent)", border: "none",
    borderRadius: 7, color: "#fff", fontSize: 13, fontFamily: "var(--font)",
    fontWeight: 600, cursor: "pointer",
  },
};
