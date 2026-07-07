"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");
const prisma = require("../config/prisma");

// ============================================================================
// SUPER ADMIN DASHBOARD — high-level stats
// ============================================================================

exports.dashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers, totalMembers, totalLeaders,
    totalProducts, activeProducts,
    totalOrders, paidOrders, pendingOrders, processingOrders, deliveredOrders,
    revenueAgg,
    ordersByNation,
    recentOrders,
    pendingProofs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "NATION_LEADER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.groupBy({
      by: ["nationId", "nationName"],
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, orderNumber: true, customerName: true, total: true,
        status: true, paymentStatus: true, createdAt: true, nationName: true,
      },
    }),
    prisma.paymentProof.count({ where: { status: "PENDING" } }),
  ]);

  return success(res, {
    users: { total: totalUsers, members: totalMembers, leaders: totalLeaders },
    products: { total: totalProducts, active: activeProducts },
    orders: {
      total: totalOrders,
      paid: paidOrders,
      pending: pendingOrders,
      processing: processingOrders,
      delivered: deliveredOrders,
    },
    revenue: { paid: revenueAgg._sum.total || 0 },
    pendingProofs,
    ordersByNation,
    recentOrders,
  });
});

// ============================================================================
// PICKUP STATION MANAGEMENT
// ============================================================================

exports.listPickupStations = asyncHandler(async (_req, res) => {
  const items = await prisma.pickupStation.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { orders: true } } },
  });
  return success(res, items);
});

exports.publicPickupStations = asyncHandler(async (_req, res) => {
  const items = await prisma.pickupStation.findMany({
    where: { status: "ACTIVE" },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true, address: true, city: true, state: true, phone: true, hours: true },
  });
  return success(res, items);
});

exports.createPickupStation = asyncHandler(async (req, res) => {
  const { name, address, city, state, phone, hours } = req.body;
  // Generate code
  const last = await prisma.pickupStation.findFirst({
    orderBy: { code: "desc" }, select: { code: true },
  });
  const next = last ? parseInt(last.code.replace("PKS", ""), 10) + 1 : 1;
  const code = "PKS" + String(next).padStart(3, "0");

  const station = await prisma.pickupStation.create({
    data: { code, name, address, city, state, phone: phone || null, hours: hours || null },
  });
  return success(res, station, "Pickup station created", 201);
});

exports.updatePickupStation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, city, state, phone, hours, status } = req.body;
  const s = await prisma.pickupStation.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(hours !== undefined ? { hours } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });
  return success(res, s, "Pickup station updated");
});

exports.deletePickupStation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.pickupStation.delete({ where: { id } });
  return success(res, null, "Pickup station deleted");
});

// ============================================================================
// REPORTS — simple JSON reports (Excel export happens in the frontend)
// ============================================================================

exports.ordersReport = asyncHandler(async (req, res) => {
  const { from, to, nationId, paymentStatus, status } = req.query;
  const where = {
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
    ...(nationId ? { nationId } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(status ? { status } : {}),
  };

  const [orders, summary] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        paymentProofs: { select: { fileUrl: true, status: true } },
      },
    }),
    prisma.order.aggregate({
      where,
      _sum: { total: true, shippingFee: true, discount: true },
      _count: { _all: true },
    }),
  ]);

  return success(res, { orders, summary });
});
