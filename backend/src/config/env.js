"use strict";

// ============================================================================
// Environment configuration — validated & typed via a single source of truth
// ============================================================================

require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback = "") {
  return process.env[name] ?? fallback;
}

function num(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) throw new Error(`Env var ${name} must be a number`);
  return n;
}

function bool(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(raw).toLowerCase());
}

const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: num("PORT", 5000),
  API_PREFIX: optional("API_PREFIX", "/api/v1"),

  CORS_ORIGINS: optional("CORS_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  DATABASE_URL: required("DATABASE_URL"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_RESET_SECRET: required("JWT_RESET_SECRET"),
  JWT_ACCESS_EXPIRES_IN: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  JWT_RESET_EXPIRES_IN: optional("JWT_RESET_EXPIRES_IN", "1h"),

  BCRYPT_ROUNDS: num("BCRYPT_ROUNDS", 12),

  UPLOAD_DIR: optional("UPLOAD_DIR", "uploads"),
  MAX_UPLOAD_SIZE_MB: num("MAX_UPLOAD_SIZE_MB", 5),

  SMTP_HOST: optional("SMTP_HOST"),
  SMTP_PORT: num("SMTP_PORT", 587),
  SMTP_SECURE: bool("SMTP_SECURE", false),
  SMTP_USER: optional("SMTP_USER"),
  SMTP_PASSWORD: optional("SMTP_PASSWORD"),
  SMTP_FROM_NAME: optional("SMTP_FROM_NAME", "Diamond Body"),
  SMTP_FROM_EMAIL: optional("SMTP_FROM_EMAIL", "no-reply@diamondbody.com"),

  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),

  RATE_LIMIT_WINDOW_MINUTES: num("RATE_LIMIT_WINDOW_MINUTES", 15),
  RATE_LIMIT_MAX_REQUESTS: num("RATE_LIMIT_MAX_REQUESTS", 300),

  SUPER_ADMIN_EMAIL: optional("SUPER_ADMIN_EMAIL", "super@diamondbody.com"),
  SUPER_ADMIN_PASSWORD: optional("SUPER_ADMIN_PASSWORD", "DiamondSuper2026!"),
  SUPER_ADMIN_NAME: optional("SUPER_ADMIN_NAME", "Super Admin"),

  ADMIN_EMAIL: optional("ADMIN_EMAIL", "admin@diamondbody.com"),
  ADMIN_PASSWORD: optional("ADMIN_PASSWORD", "DiamondAdmin2026!"),
  ADMIN_NAME: optional("ADMIN_NAME", "Diamond Admin"),

  NATION_LEADER_PASSWORD: optional("NATION_LEADER_PASSWORD", "Diamond2026!"),
};

env.isProduction = env.NODE_ENV === "production";
env.isDevelopment = env.NODE_ENV === "development";

module.exports = env;
