"use strict";

const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Runs after express-validator rules. If validation errors exist, throws 422.
 */
module.exports = function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
    value: e.value,
  }));
  next(ApiError.unprocessable("Validation failed", details));
};
