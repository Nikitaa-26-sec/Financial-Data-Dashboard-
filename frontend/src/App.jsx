// App.jsx — root of the React app
import React, { useState } from "react";
import { PortfolioProvider } from "./context/PortfolioContext";
import Sidebar   from "./components/layout/Sidebar";
import Topbar    from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Insights  from "./pages/Insights";

const PAGES = { dashboard: Dashboard, portfolio: Portfolio, watchlist: Watchlist, insights: Insights };

function AppShell() {
  const [page, setPage] = useState("dashboard");
  const Page = PAGES[page];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activePage={page} onNav={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Topbar activePage={page} />
        <main style={{ flex: 1, overflow: "auto" }}>
          <Page onNav={setPage} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppShell />
    </PortfolioProvider>
  );
}
