"use strict";

const prisma = require("../config/prisma");

/**
 * Generates a human-readable order number: DB-YYYY-NNNN
 * Numbering is per-year, monotonically increasing.
 */
async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `DB-${year}-`;

  // Find the highest existing number for this year
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let nextSeq = 1;
  if (last) {
    const n = parseInt(last.orderNumber.replace(prefix, ""), 10);
    if (!Number.isNaN(n)) nextSeq = n + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

module.exports = { generateOrderNumber };
