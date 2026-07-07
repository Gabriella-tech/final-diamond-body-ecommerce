"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const authService = require("../services/auth.service");
const env = require("../config/env");

// ============================================================================
// SUPER ADMIN — Nation Leader management
// ============================================================================

// GET /admin/leaders — all leaders across all nations
exports.listLeaders = asyncHandler(async (_req, res) => {
  const leaders = await prisma.user.findMany({
    where: { role: "NATION_LEADER" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, email: true, fullName: true, phone: true, status: true,
      createdAt: true, updatedAt: true,
      ownedNation: { select: { id: true, code: true, slug: true, name: true, status: true } },
    },
  });
  return success(res, leaders);
});

// POST /admin/leaders — create a new leader and (optionally) assign to a nation
exports.createLeader = asyncHandler(async (req, res) => {
  const { email, fullName, phone, nationId, password } = req.body;
  const lower = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) throw ApiError.conflict("A user with that email already exists");

  // Nation must exist & not already have a leader
  const nation = await prisma.nation.findUnique({ where: { id: nationId } });
  if (!nation) throw ApiError.badRequest("Nation not found");
  if (nation.leaderId) throw ApiError.conflict("This nation already has a leader");

  const passwordHash = await authService.hashPassword(password || env.NATION_LEADER_PASSWORD);

  const leader = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: lower,
        passwordHash,
        fullName,
        phone: phone || null,
        role: "NATION_LEADER",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    await tx.nation.update({ where: { id: nationId }, data: { leaderId: u.id } });
    return u;
  });

  return created(res, { leader: authService.toPublicUser(leader) }, "Nation leader created");
});

// PATCH /admin/leaders/:id — edit basic fields (name, phone) and optionally reassign nation
exports.updateLeader = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, nationId } = req.body;

  const leader = await prisma.user.findUnique({ where: { id } });
  if (!leader || leader.role !== "NATION_LEADER") throw ApiError.notFound("Leader not found");

  await prisma.$transaction(async (tx) => {
    if (fullName !== undefined || phone !== undefined) {
      await tx.user.update({
        where: { id },
        data: {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }
    if (nationId !== undefined) {
      // Detach from current nation
      await tx.nation.updateMany({ where: { leaderId: id }, data: { leaderId: null } });
      if (nationId) {
        const nation = await tx.nation.findUnique({ where: { id: nationId } });
        if (!nation) throw ApiError.badRequest("Nation not found");
        if (nation.leaderId && nation.leaderId !== id) {
          throw ApiError.conflict("Target nation already has a leader");
        }
        await tx.nation.update({ where: { id: nationId }, data: { leaderId: id } });
      }
    }
  });

  return success(res, null, "Leader updated");
});

// PATCH /admin/leaders/:id/status — activate / suspend / disable
exports.setLeaderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = new Set(["ACTIVE", "SUSPENDED", "DISABLED"]);
  if (!allowed.has(status)) throw ApiError.badRequest("Invalid status");

  const leader = await prisma.user.findUnique({ where: { id } });
  if (!leader || leader.role !== "NATION_LEADER") throw ApiError.notFound("Leader not found");

  await prisma.user.update({ where: { id }, data: { status } });
  if (status !== "ACTIVE") {
    await authService.revokeAllUserSessions(id);
  }
  return success(res, null, `Leader ${status.toLowerCase()}`);
});

// DELETE /admin/leaders/:id — delete a leader (nation is detached, members remain)
exports.deleteLeader = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const leader = await prisma.user.findUnique({ where: { id } });
  if (!leader || leader.role !== "NATION_LEADER") throw ApiError.notFound("Leader not found");
  await prisma.$transaction([
    prisma.nation.updateMany({ where: { leaderId: id }, data: { leaderId: null } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return success(res, null, "Leader deleted");
});

// POST /admin/leaders/:id/reset-password — admin sets a new password
exports.adminResetLeaderPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const leader = await prisma.user.findUnique({ where: { id } });
  if (!leader || leader.role !== "NATION_LEADER") throw ApiError.notFound("Leader not found");
  const passwordHash = await authService.hashPassword(newPassword || env.NATION_LEADER_PASSWORD);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await authService.revokeAllUserSessions(id);
  return success(res, null, "Leader password reset");
});

// ============================================================================
// NATION LEADER — self-service (scoped to their nation)
// ============================================================================

// GET /leader/dashboard — quick stats for the logged-in leader's nation
exports.leaderDashboard = asyncHandler(async (req, res) => {
  const nationId = req.scopedNationId;
  const [nation, memberCount, pendingMemberCount, orderCount, revenueAgg, recentOrders] = await Promise.all([
    prisma.nation.findUnique({ where: { id: nationId }, select: { id: true, code: true, name: true, slug: true } }),
    prisma.user.count({ where: { role: "MEMBER", nationId } }),
    prisma.user.count({ where: { role: "MEMBER", nationId, status: "PENDING" } }),
    prisma.order.count({ where: { nationId } }),
    prisma.order.aggregate({
      where: { nationId, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { nationId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, orderNumber: true, customerName: true, total: true,
        status: true, paymentStatus: true, createdAt: true,
      },
    }),
  ]);

  return success(res, {
    nation,
    stats: {
      members: memberCount,
      pendingMembers: pendingMemberCount,
      orders: orderCount,
      revenuePaid: revenueAgg._sum.total || 0,
    },
    recentOrders,
  });
});

// GET /leader/members — members in the leader's nation
exports.leaderListMembers = asyncHandler(async (req, res) => {
  const nationId = req.scopedNationId;
  const status = req.query.status;
  const members = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      nationId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, fullName: true, phone: true,
      status: true, createdAt: true, approvedAt: false,
    },
  });
  return success(res, members);
});

// PATCH /leader/members/:id/approve — leader approves a pending member
exports.leaderApproveMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const member = await prisma.user.findUnique({ where: { id } });
  if (!member || member.role !== "MEMBER") throw ApiError.notFound("Member not found");
  if (member.nationId !== req.scopedNationId) throw ApiError.forbidden("Member is not in your nation");
  if (member.status !== "PENDING") throw ApiError.badRequest("Member is not pending approval");
  await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE", approvedById: req.user.id },
  });
  return success(res, null, "Member approved");
});

// PATCH /leader/members/:id/status — leader updates status of a member in their nation
exports.leaderSetMemberStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = new Set(["ACTIVE", "SUSPENDED", "DISABLED"]);
  if (!allowed.has(status)) throw ApiError.badRequest("Invalid status");
  const member = await prisma.user.findUnique({ where: { id } });
  if (!member || member.role !== "MEMBER") throw ApiError.notFound("Member not found");
  if (member.nationId !== req.scopedNationId) throw ApiError.forbidden("Member is not in your nation");
  await prisma.user.update({ where: { id }, data: { status } });
  if (status !== "ACTIVE") await authService.revokeAllUserSessions(id);
  return success(res, null, "Member status updated");
});

// GET /leader/orders — orders in the leader's nation
exports.leaderListOrders = asyncHandler(async (req, res) => {
  const nationId = req.scopedNationId;
  const orders = await prisma.order.findMany({
    where: { nationId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      paymentProofs: { orderBy: { createdAt: "desc" } },
    },
  });
  return success(res, orders);
});

// GET /leader/orders/:id — order detail (must belong to nation)
exports.leaderGetOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, paymentProofs: true, pickupStation: true },
  });
  if (!order) throw ApiError.notFound("Order not found");
  if (order.nationId !== req.scopedNationId) throw ApiError.forbidden("Order is not in your nation");
  return success(res, order);
});
