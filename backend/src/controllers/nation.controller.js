"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

// Public: list the 8 nations (used by the frontend Nation landing pages)
exports.listPublicNations = asyncHandler(async (_req, res) => {
  const nations = await prisma.nation.findMany({
    where: { status: "ACTIVE" },
    orderBy: { code: "asc" },
    select: { id: true, code: true, slug: true, name: true, description: true },
  });
  return success(res, nations);
});

// Public: fetch one nation by slug (for landing pages)
exports.getNationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const nation = await prisma.nation.findUnique({
    where: { slug },
    select: { id: true, code: true, slug: true, name: true, description: true, status: true },
  });
  if (!nation || nation.status !== "ACTIVE") throw ApiError.notFound("Nation not found");
  return success(res, nation);
});

// Admin: full list with leaders and counts
exports.listNations = asyncHandler(async (_req, res) => {
  const nations = await prisma.nation.findMany({
    orderBy: { code: "asc" },
    include: {
      leader: {
        select: { id: true, email: true, fullName: true, phone: true, status: true },
      },
      _count: { select: { members: true, orders: true } },
    },
  });
  return success(res, nations);
});

// Admin: update a nation (name, description, status)
exports.updateNation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const updated = await prisma.nation.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });
  return success(res, updated, "Nation updated");
});
