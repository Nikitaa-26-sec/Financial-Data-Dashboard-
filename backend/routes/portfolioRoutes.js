// routes/portfolioRoutes.js
const express = require("express");
const router  = express.Router();
const {
  getAllHoldings, addHolding, updateHolding, deleteHolding, getSnapshots
} = require("../controllers/portfolioController");

router.get("/",            getAllHoldings);
router.post("/",           addHolding);
router.put("/:id",         updateHolding);
router.delete("/:id",      deleteHolding);
router.get("/snapshots",   getSnapshots);

module.exports = router;
