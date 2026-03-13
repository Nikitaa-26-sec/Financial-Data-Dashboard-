// utils/api.js — all HTTP calls to the backend in one place

import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ── Stock endpoints ──────────────────────────────────────────
export const stockAPI = {
  quote:   (symbol)  => api.get(`/stocks/quote/${symbol}`).then(r => r.data),
  history: (symbol)  => api.get(`/stocks/history/${symbol}`).then(r => r.data),
  search:  (query)   => api.get(`/stocks/search/${query}`).then(r => r.data),
};

// ── Portfolio endpoints ──────────────────────────────────────
export const portfolioAPI = {
  getAll:    ()          => api.get("/portfolio").then(r => r.data),
  add:       (data)      => api.post("/portfolio", data).then(r => r.data),
  update:    (id, data)  => api.put(`/portfolio/${id}`, data).then(r => r.data),
  remove:    (id)        => api.delete(`/portfolio/${id}`).then(r => r.data),
  snapshots: ()          => api.get("/portfolio/snapshots").then(r => r.data),
};

// ── Alert endpoints ──────────────────────────────────────────
export const alertAPI = {
  getAll: ()     => api.get("/alerts").then(r => r.data),
  create: (data) => api.post("/alerts", data).then(r => r.data),
  remove: (id)   => api.delete(`/alerts/${id}`).then(r => r.data),
  check:  ()     => api.post("/alerts/check").then(r => r.data),
};

// ── Insight endpoint ─────────────────────────────────────────
export const insightAPI = {
  analyze: () => api.post("/insights/analyze").then(r => r.data),
};
