// routes/alertRoutes.js
const express = require("express");
const router  = express.Router();
const { getAllAlerts, createAlert, deleteAlert, checkAlerts } = require("../controllers/alertController");

router.get("/",       getAllAlerts);
router.post("/",      createAlert);
router.delete("/:id", deleteAlert);
router.post("/check", checkAlerts);

module.exports = router;
