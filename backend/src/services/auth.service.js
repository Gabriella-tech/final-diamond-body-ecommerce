"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const tokenService = require("./token.service");
const mailService = require("./mail.service");

// ---------- Password ----------

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), env.BCRYPT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(String(plain), hash);
}

// ---------- Public shape of a user ----------

function toPublicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    status: u.status,
    emailVerified: u.emailVerified,
    nationId: u.nationId ?? null,
    createdAt: u.createdAt,
  };
}

// ---------- Sessions / tokens ----------

async function issueTokens(user, req) {
  const accessToken = tokenService.signAccessToken({
    sub: user.id,
    role: user.role,
    nationId: user.nationId ?? null,
  });
  const refreshToken = tokenService.signRefreshToken({ sub: user.id });

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: tokenService.sha256(refreshToken),
      userAgent: req?.headers?.["user-agent"]?.slice(0, 255) || null,
      ipAddress: req?.ip?.slice(0, 64) || null,
      expiresAt: tokenService.refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

async function rotateRefreshToken(oldRefreshToken, req) {
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(oldRefreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const hash = tokenService.sha256(oldRefreshToken);
  const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
  if (!session || session.revoked || session.expiresAt < new Date()) {
    throw ApiError.unauthorized("Session no longer valid");
  }
  if (session.userId !== decoded.sub) {
    throw ApiError.unauthorized("Session mismatch");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    throw ApiError.unauthorized("Account is not active");
  }

  // Rotate: revoke old, issue new pair
  await prisma.session.update({ where: { id: session.id }, data: { revoked: true } });
  return issueTokens(user, req);
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  const hash = tokenService.sha256(refreshToken);
  await prisma.session.updateMany({
    where: { refreshTokenHash: hash },
    data: { revoked: true },
  });
}

async function revokeAllUserSessions(userId) {
  await prisma.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
}

// ---------- Auth flows ----------

async function login({ email, password }, req) {
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    throw ApiError.forbidden("Your account is not active. Please contact support.");
  }
  if (user.status === "PENDING") {
    throw ApiError.forbidden("Your account is awaiting approval from your Nation Leader.");
  }
  const tokens = await issueTokens(user, req);
  return { user: toPublicUser(user), ...tokens };
}

async function registerMember({ email, password, fullName, phone, nationId }) {
  const lower = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) throw ApiError.conflict("An account with that email already exists");

  // If nationId provided, ensure it exists & active
  if (nationId) {
    const n = await prisma.nation.findUnique({ where: { id: nationId } });
    if (!n) throw ApiError.badRequest("Nation not found");
    if (n.status !== "ACTIVE") throw ApiError.badRequest("Nation is disabled");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: lower,
      passwordHash,
      fullName,
      phone: phone || null,
      role: "MEMBER",
      status: nationId ? "PENDING" : "ACTIVE", // nation members require approval
      nationId: nationId || null,
    },
  });
  return toPublicUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  // Invalidate all sessions on password change
  await revokeAllUserSessions(userId);
}

async function requestPasswordReset(email) {
  const lower = String(email).toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: lower } });
  // Always respond as if success (do not leak account existence)
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = tokenService.sha256(rawToken);
  const expiresAt = tokenService.resetExpiryDate();

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/#/reset-password?token=${rawToken}&uid=${user.id}`;
  await mailService.sendPasswordResetEmail({ to: user.email, fullName: user.fullName, resetUrl });
}

async function resetPassword({ userId, token, newPassword }) {
  if (!userId || !token) throw ApiError.badRequest("Invalid reset link");
  const tokenHash = tokenService.sha256(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.used || record.userId !== userId || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Reset link is invalid or expired");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    prisma.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } }),
  ]);
}

module.exports = {
  hashPassword,
  verifyPassword,
  toPublicUser,
  issueTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserSessions,
  login,
  registerMember,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
