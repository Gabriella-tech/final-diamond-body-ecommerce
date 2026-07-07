"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success, created, paginated } = require("../utils/response");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { getPagination } = require("../utils/pagination");

// ============================================================================
// PUBLIC — read
// ============================================================================

// GET /products
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const {
    q, category, featured, bestSeller, minPrice, maxPrice,
    sort = "featured",
  } = req.query;

  const where = {
    isActive: true,
    ...(featured === "true" ? { featured: true } : {}),
    ...(bestSeller === "true" ? { bestSeller: true } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
    ...(minPrice || maxPrice ? {
      price: {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      },
    } : {}),
  };

  const orderBy = (() => {
    switch (sort) {
      case "price-asc": return [{ price: "asc" }];
      case "price-desc": return [{ price: "desc" }];
      case "rating": return [{ rating: "desc" }];
      case "newest": return [{ createdAt: "desc" }];
      default: return [{ featured: "desc" }, { bestSeller: "desc" }, { createdAt: "desc" }];
    }
  })();

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      include: { category: { select: { slug: true, name: true, icon: true } } },
    }),
    prisma.product.count({ where }),
  ]);
  return paginated(res, items, page, limit, total);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!p || !p.isActive) throw ApiError.notFound("Product not found");
  return success(res, p);
});

exports.featured = asyncHandler(async (_req, res) => {
  const items = await prisma.product.findMany({
    where: { isActive: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return success(res, items);
});

exports.bestSellers = asyncHandler(async (_req, res) => {
  const items = await prisma.product.findMany({
    where: { isActive: true, bestSeller: true },
    orderBy: { rating: "desc" },
    take: 8,
  });
  return success(res, items);
});

exports.listCategories = asyncHandler(async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return success(res, cats);
});

// ============================================================================
// ADMIN — write
// ============================================================================

exports.create = asyncHandler(async (req, res) => {
  const {
    slug, name, tagline, description, benefits = [], ingredients = [],
    price, comparePrice, inventory = 0, categoryId,
    image, gallery = [], featured = false, bestSeller = false, badge,
  } = req.body;

  const p = await prisma.product.create({
    data: {
      slug, name, tagline, description,
      benefits, ingredients,
      price, comparePrice: comparePrice ?? null,
      inventory, categoryId: categoryId || null,
      image, gallery,
      featured, bestSeller, badge: badge || null,
      createdById: req.user.id,
    },
  });
  return created(res, p, "Product created");
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  // Whitelist updatable fields to avoid mass-assignment
  const allowed = [
    "slug","name","tagline","description","benefits","ingredients",
    "price","comparePrice","inventory","categoryId","image","gallery",
    "featured","bestSeller","badge","isActive",
  ];
  const patch = {};
  for (const k of allowed) if (k in data) patch[k] = data[k];
  const p = await prisma.product.update({ where: { id }, data: patch });
  return success(res, p, "Product updated");
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Soft delete by default (isActive=false) to preserve orders history
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return success(res, null, "Product deactivated");
});

exports.hardDelete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  return success(res, null, "Product permanently deleted");
});

// ---------- Categories ----------

exports.createCategory = asyncHandler(async (req, res) => {
  const { slug, name, icon } = req.body;
  const cat = await prisma.category.create({ data: { slug, name, icon: icon || null } });
  return created(res, cat, "Category created");
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { slug, name, icon } = req.body;
  const cat = await prisma.category.update({
    where: { id },
    data: {
      ...(slug !== undefined ? { slug } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(icon !== undefined ? { icon } : {}),
    },
  });
  return success(res, cat, "Category updated");
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id } });
  return success(res, null, "Category deleted");
});
