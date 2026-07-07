"use strict";

const { PrismaClient } = require("@prisma/client");
const env = require("./env");

// Singleton PrismaClient. Reuses connection pool across imports.
const prisma = new PrismaClient({
  log: env.isDevelopment ? ["warn", "error"] : ["error"],
});

process.on("beforeExit", async () => {
  try { await prisma.$disconnect(); } catch {}
});

module.exports = prisma;
