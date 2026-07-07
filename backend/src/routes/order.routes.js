"use strict";

const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { uploadPaymentProof } = require("../services/upload.service");
const c = require("../controllers/order.controller");

// Create order — either as guest or as an authenticated member.
// If Authorization header is present it will be attached to req.user later; for
// guest checkouts the header is simply absent.
router.post(
  "/",
  [
    body("customerName").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("phone").isString().trim().notEmpty(),
    body("deliveryMethod").isIn(["HOME_DELIVERY", "PICKUP_STATION"]),
    body("paymentMethod").isIn(["PAYSTACK", "BANK_TRANSFER"]),
    body("items").isArray({ min: 1 }),
    body("items.*.productId").isString().notEmpty(),
    body("items.*.quantity").isInt({ min: 1 }),
    body("nationSlug").optional().isString(),
    body("referralCode").optional().isString(),
    body("pickupStationId").optional().isString(),
    body("shippingStreet").optional().isString(),
    body("shippingCity").optional().isString(),
    body("shippingState").optional().isString(),
  ],
  validate,
  c.createOrder
);

// Upload payment proof — must be authenticated (owner) OR admin/leader
router.post(
  "/:orderId/payment-proof",
  requireAuth,
  uploadPaymentProof.single("proof"),
  c.uploadPaymentProof
);

module.exports = router;
