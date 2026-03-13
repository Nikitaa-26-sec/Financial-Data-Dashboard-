// routes/stockRoutes.js
const express = require("express");
const router  = express.Router();
const { getQuote, getHistory, searchSymbol } = require("../controllers/stockController");

router.get("/quote/:symbol",   getQuote);
router.get("/history/:symbol", getHistory);
router.get("/search/:query",   searchSymbol);

module.exports = router;
