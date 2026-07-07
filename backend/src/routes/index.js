"use strict";

const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/nations", require("./nation.routes"));
router.use("/products", require("./product.routes"));
router.use("/pickup-stations", require("./pickupStation.routes"));
router.use("/orders", require("./order.routes"));
router.use("/members", require("./member.routes"));
router.use("/leader", require("./leader.routes"));
router.use("/admin", require("./admin.routes"));

// Health check
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Diamond Body API healthy", timestamp: new Date().toISOString() });
});

module.exports = router;
