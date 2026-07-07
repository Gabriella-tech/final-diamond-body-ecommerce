"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

// ---------- JWT ----------

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function signResetToken(payload) {
  return jwt.sign(payload, env.JWT_RESET_SECRET, { expiresIn: env.JWT_RESET_EXPIRES_IN });
}
function verifyResetToken(token) {
  return jwt.verify(token, env.JWT_RESET_SECRET);
}

// ---------- Hashing (for storing refresh tokens & reset tokens) ----------

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

// ---------- Expiry helpers ----------

function refreshExpiryDate() {
  // Rough conversion of "7d" style into a Date (jwt handles the real expiry)
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)([smhd])$/.exec(String(raw));
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return new Date(Date.now() + value * ms);
}

function resetExpiryDate() {
  const raw = env.JWT_RESET_EXPIRES_IN;
  const match = /^(\d+)([smhd])$/.exec(String(raw));
  if (!match) return new Date(Date.now() + 60 * 60 * 1000);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return new Date(Date.now() + value * ms);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
  sha256,
  refreshExpiryDate,
  resetExpiryDate,
};
