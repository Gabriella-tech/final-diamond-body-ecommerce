"use strict";

const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const c = require("../controllers/auth.controller");

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isString().isLength({ min: 4 }).withMessage("Password required"),
  ],
  validate,
  c.login
);

router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isString().isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("fullName").isString().trim().isLength({ min: 2 }).withMessage("Full name required"),
    body("phone").optional().isString(),
    body("nationId").optional().isString(),
  ],
  validate,
  c.register
);

router.post(
  "/refresh",
  [body("refreshToken").isString().notEmpty()],
  validate,
  c.refresh
);

router.post(
  "/logout",
  [body("refreshToken").optional().isString()],
  validate,
  c.logout
);

router.get("/me", requireAuth, c.me);

router.post(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 8 }),
  ],
  validate,
  c.changePassword
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate,
  c.forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("userId").isString().notEmpty(),
    body("token").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 8 }),
  ],
  validate,
  c.resetPassword
);

module.exports = router;
