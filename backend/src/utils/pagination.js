"use strict";

/**
 * Parses ?page & ?limit from a request into safe integers with sane bounds.
 */
function getPagination(req, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let limit = parseInt(req.query.limit, 10) || defaultLimit;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { getPagination };
