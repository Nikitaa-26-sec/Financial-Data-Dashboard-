import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global animation keyframes injected once here
const style = document.createElement("style");
style.textContent = `
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  tr:hover { background: rgba(255,255,255,0.02); }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
