"use strict";

/**
 * Typed HTTP error that the global error handler recognizes.
 * Throw these from services/controllers instead of untyped errors.
 */
class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request", details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = "Unauthorized")        { return new ApiError(401, msg); }
  static forbidden(msg = "Forbidden")              { return new ApiError(403, msg); }
  static notFound(msg = "Not found")               { return new ApiError(404, msg); }
  static conflict(msg = "Conflict", details)       { return new ApiError(409, msg, details); }
  static unprocessable(msg = "Unprocessable entity", details) { return new ApiError(422, msg, details); }
  static tooMany(msg = "Too many requests")        { return new ApiError(429, msg); }
  static internal(msg = "Internal server error")   { return new ApiError(500, msg); }
}

module.exports = ApiError;
