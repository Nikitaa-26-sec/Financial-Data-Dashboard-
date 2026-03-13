// routes/insightRoutes.js
const express = require("express");
const router  = express.Router();
const { analyzePortfolio } = require("../controllers/insightController");

router.post("/analyze", analyzePortfolio);

module.exports = router;
