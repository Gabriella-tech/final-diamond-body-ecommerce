"use strict";

const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const admin = require("../controllers/admin.controller");
const leader = require("../controllers/leader.controller");
const product = require("../controllers/product.controller");
const order = require("../controllers/order.controller");
const nation = require("../controllers/nation.controller");

// Everything under /admin requires ADMIN or SUPER_ADMIN
router.use(requireAuth, requireRole("ADMIN"));

// ---------- Dashboard ----------
router.get("/dashboard", admin.dashboard);

// ---------- Nations ----------
router.get("/nations", nation.listNations);
router.patch(
  "/nations/:id",
  [
    body("name").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isIn(["ACTIVE", "DISABLED"]),
  ],
  validate,
  nation.updateNation
);

// ---------- Nation Leaders ----------
router.get("/leaders", leader.listLeaders);
router.post(
  "/leaders",
  [
    body("email").isEmail().normalizeEmail(),
    body("fullName").isString().notEmpty(),
    body("phone").optional().isString(),
    body("nationId").isString().notEmpty(),
    body("password").optional().isString().isLength({ min: 8 }),
  ],
  validate,
  leader.createLeader
);
router.patch(
  "/leaders/:id",
  [
    body("fullName").optional().isString(),
    body("phone").optional().isString(),
    body("nationId").optional().isString(),
  ],
  validate,
  leader.updateLeader
);
router.patch(
  "/leaders/:id/status",
  [body("status").isIn(["ACTIVE", "SUSPENDED", "DISABLED"])],
  validate,
  leader.setLeaderStatus
);
router.post(
  "/leaders/:id/reset-password",
  [body("newPassword").optional().isString().isLength({ min: 8 })],
  validate,
  leader.adminResetLeaderPassword
);
router.delete("/leaders/:id", leader.deleteLeader);

// ---------- Products ----------
router.post(
  "/products",
  [
    body("slug").isString().notEmpty(),
    body("name").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("price").isNumeric(),
    body("image").isString().notEmpty(),
  ],
  validate,
  product.create
);
router.patch("/products/:id", product.update);
router.delete("/products/:id", product.remove);
router.delete("/products/:id/permanent", requireRole("SUPER_ADMIN"), product.hardDelete);

// Categories
router.post(
  "/categories",
  [body("slug").isString().notEmpty(), body("name").isString().notEmpty()],
  validate,
  product.createCategory
);
router.patch("/categories/:id", product.updateCategory);
router.delete("/categories/:id", product.deleteCategory);

// ---------- Orders ----------
router.get("/orders", order.adminListOrders);
router.get("/orders/:id", order.adminGetOrder);
router.patch(
  "/orders/:id/status",
  [body("status").optional().isString(), body("trackingNumber").optional().isString(), body("adminNotes").optional().isString()],
  validate,
  order.updateOrderStatus
);

// ---------- Payment proofs ----------
router.patch(
  "/payment-proofs/:id",
  [
    body("action").isIn(["APPROVE", "REJECT"]),
    body("rejectionReason").optional().isString(),
  ],
  validate,
  order.reviewPaymentProof
);

// ---------- Pickup Stations ----------
router.get("/pickup-stations", admin.listPickupStations);
router.post(
  "/pickup-stations",
  [
    body("name").isString().notEmpty(),
    body("address").isString().notEmpty(),
    body("city").isString().notEmpty(),
    body("state").isString().notEmpty(),
  ],
  validate,
  admin.createPickupStation
);
router.patch("/pickup-stations/:id", admin.updatePickupStation);
router.delete("/pickup-stations/:id", admin.deletePickupStation);

// ---------- Reports ----------
router.get("/reports/orders", admin.ordersReport);

module.exports = router;
