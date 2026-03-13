// utils/formatters.js — shared formatting helpers

export const fmt = {
  // $1,234.56
  currency: (n) =>
    n == null ? "—" :
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n),

  // +1,234.56 or -1,234.56  (with sign)
  currencySigned: (n) =>
    n == null ? "—" : (n >= 0 ? "+" : "") + fmt.currency(n),

  // 12.34%  (with sign)
  percent: (n, decimals = 2) =>
    n == null ? "—" : `${n >= 0 ? "+" : ""}${Number(n).toFixed(decimals)}%`,

  // 1,234,567
  number: (n) =>
    n == null ? "—" : new Intl.NumberFormat("en-US").format(n),

  // Compact: 1.2M, 34.5K
  compact: (n) =>
    n == null ? "—" :
    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n),

  // "Mar 15"
  date: (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),

  // "Mar 15, 2024"
  dateFull: (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
};

// Returns CSS color variable name based on value sign
export function gainColor(value) {
  if (value === null || value === undefined) return "var(--muted)";
  return value >= 0 ? "var(--green)" : "var(--red)";
}

// Returns ▲ or ▼ based on value sign
export function arrow(value) {
  return value >= 0 ? "▲" : "▼";
}

// Sector → color mapping for charts
export const SECTOR_COLORS = {
  Technology:  "#3b82f6",
  Finance:     "#8b5cf6",
  Healthcare:  "#10b981",
  Consumer:    "#f59e0b",
  Energy:      "#ef4444",
  Industrials: "#06b6d4",
  Other:       "#64748b",
};
