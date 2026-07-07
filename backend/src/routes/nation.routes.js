"use strict";

const router = require("express").Router();
const c = require("../controllers/nation.controller");

// Public — frontend uses these on the 8 nation landing pages
router.get("/", c.listPublicNations);
router.get("/slug/:slug", c.getNationBySlug);

module.exports = router;
