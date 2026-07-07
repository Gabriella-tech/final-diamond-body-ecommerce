"use strict";

const router = require("express").Router();
const c = require("../controllers/admin.controller");

// Public — for checkout page
router.get("/", c.publicPickupStations);

module.exports = router;
