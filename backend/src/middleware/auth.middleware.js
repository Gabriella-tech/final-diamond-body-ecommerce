"use strict";

const ApiError = require("../utils/ApiError");
const tokenService = require("../services/token.service");
const prisma = require("../config/prisma");

/**
 * Extracts the Bearer JWT from the Authorization header and attaches
 * the resolved user to req.user. Throws 401 if invalid/missing.
 */
async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(ApiError.unauthorized("Missing or invalid Authorization header"));
    }
    let decoded;
    try {
      decoded = tokenService.verifyAccessToken(token);
    } catch {
      return next(ApiError.unauthorized("Invalid or expired access token"));
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) return next(ApiError.unauthorized("User no longer exists"));
    if (user.status !== "ACTIVE") {
      return next(ApiError.forbidden("Account is not active"));
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * requireRole("SUPER_ADMIN") — allows only listed roles.
 * SUPER_ADMIN always passes (superset).
 */
function requireRole(...allowedRoles) {
  const allowed = new Set(allowedRoles);
  return function (req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === "SUPER_ADMIN") return next(); // superuser bypass
    if (!allowed.has(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}

/**
 * Scopes queries for a NATION_LEADER to their own nation only.
 * Populates req.scopedNationId (either their nationId or null for admins).
 */
function scopeToNation(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role === "NATION_LEADER") {
    // Find the nation they own
    prisma.nation.findUnique({ where: { leaderId: req.user.id } })
      .then((n) => {
        if (!n) return next(ApiError.forbidden("You are not assigned to any nation"));
        req.scopedNationId = n.id;
        req.scopedNation = n;
        next();
      })
      .catch(next);
  } else {
    req.scopedNationId = null; // admins see everything
    next();
  }
}

module.exports = { requireAuth, requireRole, scopeToNation };
