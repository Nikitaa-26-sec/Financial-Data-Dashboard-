// ============================================================
// middleware/errorHandler.js
// ------------------------------------------------------------
// Catches any errors thrown in controllers and sends a clean
// JSON error response instead of crashing or leaking stack traces.
// ============================================================

function errorHandler(err, req, res, _next) {
  // Log full error on server (not sent to client)
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error → 400 Bad Request
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Mongoose duplicate key error → 409 Conflict
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }

  // Generic server error
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
