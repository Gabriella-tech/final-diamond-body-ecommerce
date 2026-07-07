"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success, paginated } = require("../utils/response");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { getPagination } = require("../utils/pagination");

// ============================================================================
// MEMBER SELF-SERVICE
// ============================================================================

// GET /members/me
exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, fullName: true, phone: true, role: true, status: true,
      nation: { select: { id: true, code: true, slug: true, name: true } },
      addresses: true,
      createdAt: true,
    },
  });
  return success(res, user);
});

// PATCH /members/me
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
    },
    select: { id: true, email: true, fullName: true, phone: true, role: true },
  });
  return success(res, updated, "Profile updated");
});

// GET /members/me/orders
exports.myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip, take: limit,
      include: { items: true, paymentProofs: true },
    }),
    prisma.order.count({ where: { userId: req.user.id } }),
  ]);
  return paginated(res, items, page, limit, total);
});

// GET /members/me/orders/:id
exports.myOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, paymentProofs: true, pickupStation: true },
  });
  if (!order || order.userId !== req.user.id) throw ApiError.notFound("Order not found");
  return success(res, order);
});

// ============================================================================
// ADDRESSES
// ============================================================================

exports.listAddresses = asyncHandler(async (req, res) => {
  const list = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return success(res, list);
});

exports.addAddress = asyncHandler(async (req, res) => {
  const { label, fullName, phone, street, city, state, country, isDefault } = req.body;
  const addr = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId: req.user.id,
        label: label || "Home",
        fullName, phone, street, city, state,
        country: country || "Nigeria",
        isDefault: !!isDefault,
      },
    });
  });
  return success(res, addr, "Address added", 201);
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const found = await prisma.address.findUnique({ where: { id } });
  if (!found || found.userId !== req.user.id) throw ApiError.notFound("Address not found");
  await prisma.address.delete({ where: { id } });
  return success(res, null, "Address deleted");
});

// ============================================================================
// SUPER ADMIN — list all members
// ============================================================================

exports.adminListMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const { nationId, status, q } = req.query;

  const where = {
    role: "MEMBER",
    ...(nationId ? { nationId } : {}),
    ...(status ? { status } : {}),
    ...(q ? {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, fullName: true, phone: true, status: true, createdAt: true,
        nation: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return paginated(res, items, page, limit, total);
});
