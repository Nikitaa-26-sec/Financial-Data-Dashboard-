// components/charts/SectorPieChart.jsx
// Pie chart of portfolio allocation by sector.
// Warns if any sector exceeds 40% concentration.

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usePortfolioContext } from "../../context/PortfolioContext";
import { SECTOR_COLORS, fmt } from "../../utils/formatters";
import { CardTitle } from "../ui";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "8px 14px", fontSize: 13,
    }}>
      <p style={{ color: d.payload.fill, fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>
        {d.payload.pct.toFixed(1)}% · {fmt.currency(d.value)}
      </p>
    </div>
  );
}

export default function SectorPieChart() {
  const { sectors, totals } = usePortfolioContext();

  const data = Object.entries(sectors).map(([name, value]) => ({
    name,
    value,
    pct: totals.value > 0 ? (value / totals.value) * 100 : 0,
    fill: SECTOR_COLORS[name] || SECTOR_COLORS.Other,
  }));

  // Find over-concentrated sectors
  const concentrated = data.filter(d => d.pct > 40);

  return (
    <div>
      <CardTitle>Sector Allocation</CardTitle>

      {/* Concentration warning */}
      {concentrated.map(d => (
        <div key={d.name} style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 6, padding: "6px 10px",
          fontSize: 12, color: "var(--yellow)", marginBottom: 10,
        }}>
          ⚠ {d.name} is {d.pct.toFixed(0)}% of your portfolio — consider diversifying
        </div>
      ))}

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} stroke="var(--surface)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 12, color: "var(--muted)" }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
