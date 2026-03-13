// components/charts/StockMiniChart.jsx
// A tiny sparkline showing 30-day price trend for one stock.

import React from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { fmt, gainColor } from "../../utils/formatters";

function MiniTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "5px 9px", fontSize: 11,
    }}>
      <p style={{ color: "var(--muted)" }}>{fmt.date(payload[0].payload.date)}</p>
      <p style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>
        {fmt.currency(payload[0].value)}
      </p>
    </div>
  );
}

export default function StockMiniChart({ history, gainDollars }) {
  if (!history || history.length < 2) {
    return <div style={{ width: 100, height: 40, opacity: 0.3, fontSize: 12, color: "var(--muted)" }}>No data</div>;
  }

  const color = gainDollars >= 0 ? "#10b981" : "#ef4444";

  return (
    <ResponsiveContainer width={110} height={40}>
      <AreaChart data={history}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color})`}
          dot={false}
        />
        <Tooltip content={<MiniTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
