"use strict";

const router = require("express").Router();
const c = require("../controllers/product.controller");

// Public read
router.get("/", c.list);
router.get("/featured", c.featured);
router.get("/best-sellers", c.bestSellers);
router.get("/categories", c.listCategories);
router.get("/:slug", c.getBySlug);

module.exports = router;
