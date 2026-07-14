"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success, created, paginated } = require("../utils/response");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { getPagination } = require("../utils/pagination");
const { generateOrderNumber } = require("../utils/orderNumber");
const uploadService = require("../services/upload.service");

// ============================================================================
// PUBLIC / MEMBER — create order
// ============================================================================

exports.createOrder = asyncHandler(async (req, res) => {
  console.log("DEBUG: Incoming Request Body:", req.body);
  const {
    // Contact
    customerName, email, phone,
    // Nation attribution (from URL)
    nationSlug,
    // Optional referral
    referralCode,
    // Delivery
    deliveryMethod,          // "HOME_DELIVERY" | "PICKUP_STATION"
    shippingStreet, shippingCity, shippingState, shippingCountry,
    pickupStationId,
    // Money
    shippingFee = 0, discount = 0, promoCode,
    // Payment
    paymentMethod,           // "PAYSTACK" | "BANK_TRANSFER"
    paystackReference,
    // Items
    items,                   // [{ productId, quantity }]
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest("Order must contain at least one item");
  }

  // Resolve nation (optional)
  let nation = null;
  if (nationSlug) {
    nation = await prisma.nation.findUnique({ where: { slug: String(nationSlug) } });
    if (!nation || nation.status !== "ACTIVE") {
      throw ApiError.badRequest("Invalid nation");
    }
  }

  // Resolve pickup station if applicable
  let pickup = null;
  if (deliveryMethod === "PICKUP_STATION") {
    if (!pickupStationId) throw ApiError.badRequest("Pickup station is required for pickup delivery");
    pickup = await prisma.pickupStation.findUnique({ where: { id: pickupStationId } });
    if (!pickup || pickup.status !== "ACTIVE") throw ApiError.badRequest("Pickup station not available");
  } else if (deliveryMethod === "HOME_DELIVERY") {
    if (!shippingStreet || !shippingCity || !shippingState) {
      throw ApiError.badRequest("Shipping address is required for home delivery");
    }
  } else {
    throw ApiError.badRequest("Invalid delivery method");
  }

  // Load products and lock in prices from server (never trust client prices)
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    throw ApiError.badRequest("One or more products are invalid or inactive");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = productMap.get(i.productId);
    const qty = Math.max(1, parseInt(i.quantity, 10) || 1);
    if (p.inventory !== null && p.inventory !== undefined && p.inventory < qty) {
      throw ApiError.badRequest(`Insufficient stock for ${p.name}`);
    }
    const line = Number(p.price) * qty;
    subtotal += line;
    return { productId: p.id, name: p.name, price: p.price, quantity: qty };
  });

  const effectiveShipping = deliveryMethod === "PICKUP_STATION" ? 0 : Number(shippingFee || 0);
  const total = subtotal + effectiveShipping - Number(discount || 0);
  if (total < 0) throw ApiError.badRequest("Total cannot be negative");

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNumber,
        userId: req.user?.id || null,
        customerName, email: String(email).toLowerCase(), phone,
        nationId: nation?.id || null,
        nationName: nation?.name || null,
        nationSlug: nation?.slug || null,
        referralCode: referralCode || null,
        deliveryMethod,
        shippingStreet: shippingStreet || null,
        shippingCity: shippingCity || null,
        shippingState: shippingState || null,
        shippingCountry: shippingCountry || "Nigeria",
        pickupStationId: pickup?.id || null,
        pickupStationName: pickup?.name || null,
        subtotal, shippingFee: effectiveShipping, discount, total,
        promoCode: promoCode || null,
        paymentMethod,
        paymentStatus: paymentMethod === "PAYSTACK" && paystackReference ? "PAID" : "UNPAID",
        paystackReference: paystackReference || null,
        status: paymentMethod === "PAYSTACK" && paystackReference ? "PROCESSING" : "AWAITING_PAYMENT",
        items: { createMany: { data: orderItems } },
      },
      include: { items: true },
    });

    // Decrement inventory
    for (const it of orderItems) {
      await tx.product.update({
        where: { id: it.productId },
        data: { inventory: { decrement: it.quantity } },
      });
    }
    return o;
  });

  return created(res, order, "Order placed");
});

// ============================================================================
// PAYMENT PROOF UPLOAD (member)
// Multer runs before this controller; req.file has the uploaded file
// ============================================================================

exports.uploadPaymentProof = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw ApiError.notFound("Order not found");
  // Members can only upload for their own orders
  if (req.user.role === "MEMBER" && order.userId !== req.user.id) {
    throw ApiError.forbidden("You cannot upload proof for someone else's order");
  }
  if (order.paymentMethod !== "BANK_TRANSFER") {
    throw ApiError.badRequest("Payment proofs are only for bank transfer orders");
  }

  const publicUrl = uploadService.paymentProofPublicUrl(req.file.filename);

  const proof = await prisma.$transaction(async (tx) => {
    const p = await tx.paymentProof.create({
      data: {
        orderId,
        fileUrl: publicUrl,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "AWAITING_VERIFICATION" },
    });
    return p;
  });

  return created(res, proof, "Payment proof uploaded — awaiting verification");
});

// ============================================================================
// ADMIN — orders
// ============================================================================

exports.adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const { status, paymentStatus, nationId, q, from, to } = req.query;

  const where = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(nationId ? { nationId } : {}),
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
    ...(q ? {
      OR: [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        paymentProofs: { orderBy: { createdAt: "desc" } },
        nation: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return paginated(res, items, page, limit, total);
});

exports.adminGetOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      paymentProofs: { orderBy: { createdAt: "desc" } },
      pickupStation: true,
      nation: true,
      user: { select: { id: true, email: true, fullName: true } },
    },
  });
  if (!order) throw ApiError.notFound("Order not found");
  return success(res, order);
});

// PATCH /admin/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, adminNotes } = req.body;
  const allowed = new Set([
    "PENDING","AWAITING_PAYMENT","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED",
  ]);
  if (status && !allowed.has(status)) throw ApiError.badRequest("Invalid status");
  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });
  return success(res, updated, "Order updated");
});

// PATCH /admin/payment-proofs/:id — approve or reject
exports.reviewPaymentProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // action: "APPROVE" | "REJECT"

  const proof = await prisma.paymentProof.findUnique({ where: { id } });
  if (!proof) throw ApiError.notFound("Payment proof not found");
  if (proof.status !== "PENDING") throw ApiError.badRequest("Proof has already been reviewed");

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    if (action === "APPROVE") {
      await tx.paymentProof.update({
        where: { id },
        data: { status: "APPROVED", reviewedById: req.user.id, reviewedAt: now },
      });
      await tx.order.update({
        where: { id: proof.orderId },
        data: { paymentStatus: "PAID", status: "PROCESSING" },
      });
    } else if (action === "REJECT") {
      await tx.paymentProof.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || null,
          reviewedById: req.user.id,
          reviewedAt: now,
        },
      });
      await tx.order.update({
        where: { id: proof.orderId },
        data: { paymentStatus: "FAILED" },
      });
    } else {
      throw ApiError.badRequest("action must be APPROVE or REJECT");
    }
  });

  return success(res, null, `Payment proof ${action.toLowerCase()}d`);
});