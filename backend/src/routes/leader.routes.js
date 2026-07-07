"use strict";

const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const { requireAuth, requireRole, scopeToNation } = require("../middleware/auth.middleware");
const c = require("../controllers/leader.controller");

router.use(requireAuth, requireRole("NATION_LEADER"), scopeToNation);

router.get("/dashboard", c.leaderDashboard);

// Members (scoped to leader's nation)
router.get("/members", c.leaderListMembers);
router.patch("/members/:id/approve", c.leaderApproveMember);
router.patch(
  "/members/:id/status",
  [body("status").isIn(["ACTIVE", "SUSPENDED", "DISABLED"])],
  validate,
  c.leaderSetMemberStatus
);

// Orders (scoped)
router.get("/orders", c.leaderListOrders);
router.get("/orders/:id", c.leaderGetOrder);

module.exports = router;
