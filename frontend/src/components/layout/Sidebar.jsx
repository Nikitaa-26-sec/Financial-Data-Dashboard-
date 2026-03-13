// components/layout/Sidebar.jsx
import React from "react";

const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "⬡" },
  { id: "portfolio",  label: "Portfolio",  icon: "◈" },
  { id: "watchlist",  label: "Watchlist",  icon: "◎" },
  { id: "insights",   label: "AI Insights",icon: "✦" },
];

export default function Sidebar({ activePage, onNav }) {
  return (
    <aside style={s.aside}>
      {/* Logo */}
      <div style={s.logo}>
        <span style={s.logoMark}>◈</span>
        <span style={s.logoText}>FinPulse</span>
      </div>

      {/* Nav links */}
      <nav style={s.nav}>
        {NAV.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              style={{ ...s.navItem, ...(active ? s.navActive : {}) }}
              onClick={() => onNav(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span style={s.navDot} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div style={s.badge}>
        <div style={s.badgeDot} />
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Live Data</span>
      </div>
    </aside>
  );
}

const s = {
  aside: {
    width: 220,
    minHeight: "100vh",
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 20px 28px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 16,
  },
  logoMark: { fontSize: 22, color: "var(--accent)" },
  logoText:  { fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.4px" },
  nav:  { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "none",
    border: "none",
    color: "var(--muted)",
    fontSize: 14,
    fontFamily: "var(--font)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    position: "relative",
    transition: "all 0.15s",
  },
  navActive: {
    background: "rgba(59,130,246,0.12)",
    color: "var(--accent)",
  },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  navDot: {
    position: "absolute",
    right: 10,
    width: 6, height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 20px 0",
    borderTop: "1px solid var(--border)",
    marginTop: "auto",
  },
  badgeDot: {
    width: 7, height: 7,
    borderRadius: "50%",
    background: "var(--green)",
    boxShadow: "0 0 6px var(--green)",
    animation: "pulse 2s infinite",
  },
};
