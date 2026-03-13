// context/PortfolioContext.jsx
// ------------------------------------------------------------
// React Context holds data that many components need at once.
// Instead of passing props through 5 levels, any component
// can call usePortfolioContext() and get the data directly.
// ------------------------------------------------------------

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { portfolioAPI, stockAPI, alertAPI } from "../utils/api";

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [holdings,   setHoldings]   = useState([]);
  const [enriched,   setEnriched]   = useState([]);   // holdings + live prices + risk
  const [alerts,     setAlerts]     = useState([]);
  const [snapshots,  setSnapshots]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [triggered,  setTriggered]  = useState([]);   // newly fired alerts

  // ── Load and enrich all holdings ────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const raw = await portfolioAPI.getAll();
      setHoldings(raw);

      // Fetch live quote + risk for every holding in parallel
      const enrichedData = await Promise.all(
        raw.map(async (h) => {
          try {
            const [quoteData, histData] = await Promise.all([
              stockAPI.quote(h.symbol),
              stockAPI.history(h.symbol),
            ]);

            const price        = quoteData.price;
            const currentValue = price * h.shares;
            const totalCost    = h.avgBuyPrice * h.shares;
            const gainDollars  = currentValue - totalCost;
            const gainPercent  = totalCost > 0 ? (gainDollars / totalCost) * 100 : 0;

            return {
              ...h,
              price,
              dailyChange:    quoteData.change,
              dailyChangePct: quoteData.changePct,
              currentValue,
              totalCost,
              gainDollars,
              gainPercent,
              history:  histData.history  || [],
              metrics:  histData.metrics  || {},
            };
          } catch {
            return { ...h, price: null, error: "Price unavailable" };
          }
        })
      );

      setEnriched(enrichedData);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Could not load portfolio. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load alerts ──────────────────────────────────────────────
  const loadAlerts = useCallback(async () => {
    try {
      const data = await alertAPI.getAll();
      setAlerts(data);
    } catch { /* non-critical */ }
  }, []);

  // ── Load snapshot history ────────────────────────────────────
  const loadSnapshots = useCallback(async () => {
    try {
      const data = await portfolioAPI.snapshots();
      setSnapshots(data);
    } catch { /* non-critical */ }
  }, []);

  // ── Check if any alerts fired ────────────────────────────────
  const checkAlerts = useCallback(async () => {
    try {
      const result = await alertAPI.check();
      if (result.triggered?.length > 0) {
        setTriggered(result.triggered);
        loadAlerts(); // refresh alert list
      }
    } catch { /* non-critical */ }
  }, [loadAlerts]);

  // ── Portfolio math totals ────────────────────────────────────
  const totals = enriched.reduce(
    (acc, h) => ({
      value:   acc.value   + (h.currentValue || 0),
      cost:    acc.cost    + (h.totalCost    || 0),
      gain:    acc.gain    + (h.gainDollars  || 0),
    }),
    { value: 0, cost: 0, gain: 0 }
  );
  totals.gainPct = totals.cost > 0 ? (totals.gain / totals.cost) * 100 : 0;

  // ── Sector allocation (for pie chart + warning) ──────────────
  const sectors = enriched.reduce((acc, h) => {
    const sector = h.sector || "Other";
    acc[sector] = (acc[sector] || 0) + (h.currentValue || 0);
    return acc;
  }, {});

  // ── Auto-refresh every 60 seconds ───────────────────────────
  useEffect(() => {
    loadAll();
    loadAlerts();
    loadSnapshots();

    const interval = setInterval(() => {
      loadAll();
      checkAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadAll, loadAlerts, loadSnapshots, checkAlerts]);

  // ── CRUD helpers ─────────────────────────────────────────────
  const addHolding = async (data) => {
    await portfolioAPI.add(data);
    await loadAll();
  };

  const removeHolding = async (id) => {
    await portfolioAPI.remove(id);
    await loadAll();
  };

  const updateHolding = async (id, data) => {
    await portfolioAPI.update(id, data);
    await loadAll();
  };

  const addAlert = async (data) => {
    await alertAPI.create(data);
    await loadAlerts();
  };

  const removeAlert = async (id) => {
    await alertAPI.remove(id);
    await loadAlerts();
  };

  const dismissTriggered = () => setTriggered([]);

  return (
    <PortfolioContext.Provider value={{
      holdings, enriched, alerts, snapshots,
      loading, error, lastUpdate, triggered,
      totals, sectors,
      addHolding, removeHolding, updateHolding,
      addAlert, removeAlert, dismissTriggered,
      refresh: loadAll,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolioContext must be used inside PortfolioProvider");
  return ctx;
}
