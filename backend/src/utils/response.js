"use strict";

/**
 * Uniform API response envelope. Every controller uses these helpers so
 * the frontend can rely on a stable JSON shape.
 */
function success(res, data = null, message = "OK", status = 200, meta = undefined) {
  const body = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}

function created(res, data = null, message = "Created") {
  return success(res, data, message, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function paginated(res, items, page, limit, total, message = "OK") {
  return success(res, items, message, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

module.exports = { success, created, noContent, paginated };
