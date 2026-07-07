"use strict";

// ============================================================================
// Diamond Body API — HTTP server bootstrap
// ============================================================================

const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");

async function main() {
  // Fail fast if DB is unreachable
  try {
    await prisma.$connect();
    console.log("[db] Connected to PostgreSQL");
  } catch (err) {
    console.error("[db] FAILED to connect:", err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[server] Diamond Body API running on http://localhost:${env.PORT}`);
    console.log(`[server] API prefix: ${env.API_PREFIX}`);
    console.log(`[server] Env: ${env.NODE_ENV}`);
    console.log(`[server] CORS: ${env.CORS_ORIGINS.join(", ")}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received — shutting down gracefully`);
    server.close(async () => {
      try { await prisma.$disconnect(); } catch {}
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
  });
}

main();
