"use strict";

const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const c = require("../controllers/member.controller");

router.use(requireAuth);

// Profile
router.get("/me", c.getMyProfile);
router.patch(
  "/me",
  [
    body("fullName").optional().isString().trim(),
    body("phone").optional().isString(),
  ],
  validate,
  c.updateMyProfile
);

// Orders
router.get("/me/orders", c.myOrders);
router.get("/me/orders/:id", c.myOrderDetail);

// Addresses
router.get("/me/addresses", c.listAddresses);
router.post(
  "/me/addresses",
  [
    body("fullName").isString().notEmpty(),
    body("phone").isString().notEmpty(),
    body("street").isString().notEmpty(),
    body("city").isString().notEmpty(),
    body("state").isString().notEmpty(),
  ],
  validate,
  c.addAddress
);
router.delete("/me/addresses/:id", c.deleteAddress);

// Admin listing of all members
router.get("/", requireRole("ADMIN"), c.adminListMembers);

module.exports = router;
