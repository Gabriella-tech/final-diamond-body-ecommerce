"use strict";

const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { Prisma } = require("@prisma/client");

// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Central error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Multer errors
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target;
      return res.status(409).json({
        success: false,
        message: `Duplicate value for unique field${target ? `: ${target}` : ""}`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Fallback
  const status = err.status || 500;
  const message = status >= 500 && env.isProduction ? "Internal server error" : (err.message || "Server error");
  const body = { success: false, message };
  if (!env.isProduction && err.stack) body.stack = err.stack;
  if (status >= 500) {
    // Only log unexpected errors
    console.error("[ERROR]", err);
  }
  res.status(status).json(body);
}

module.exports = { notFoundHandler, errorHandler };
