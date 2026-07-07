"use strict";

/**
 * Wraps an async route handler so any thrown/rejected error is forwarded
 * to Express's error middleware without manual try/catch boilerplate.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
