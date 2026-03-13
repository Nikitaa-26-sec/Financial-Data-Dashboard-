// components/charts/PortfolioValueChart.jsx
// Shows portfolio total value over time using saved snapshots.
// If no snapshots yet, shows a placeholder message.

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { fmt } from "../../utils/formatters";
import { usePortfolioContext } from "../../context/PortfolioContext";
import { CardTitle } from "../ui";

// Custom tooltip shown on hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 14px", fontSize: 13,
    }}>
      <p style={{ color: "var(--muted)", marginBottom: 4 }}>{fmt.dateFull(label)}</p>
      <p style={{ color: "var(--accent)", fontWeight: 600, fontFamily: "var(--mono)" }}>
        {fmt.currency(payload[0].value)}
      </p>
    </div>
  );
}

export default function PortfolioValueChart() {
  const { snapshots, totals } = usePortfolioContext();

  // If we have real snapshot history, use it.
  // Otherwise build a single-point array from current totals for display.
  const data = snapshots.length > 0
    ? snapshots.map(s => ({ date: s.date, value: s.totalValue }))
    : [{ date: new Date().toISOString(), value: totals.value }];

  return (
    <div>
      <CardTitle>Portfolio Value Over Time</CardTitle>
      {snapshots.length === 0 && (
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
          Daily snapshots are saved at market close. History will appear here after your first trading day.
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={fmt.date}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={v => `$${fmt.compact(v)}`}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
