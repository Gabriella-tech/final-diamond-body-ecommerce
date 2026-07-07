"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");
const authService = require("../services/auth.service");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password }, req);
  return success(res, result, "Login successful");
});

exports.register = asyncHandler(async (req, res) => {
  const { email, password, fullName, phone, nationId } = req.body;
  const user = await authService.registerMember({ email, password, fullName, phone, nationId });
  return created(res, { user }, "Registration successful. Awaiting approval if a nation was selected.");
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.rotateRefreshToken(refreshToken, req);
  return success(res, tokens, "Tokens refreshed");
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.revokeRefreshToken(refreshToken);
  return success(res, null, "Logged out");
});

exports.me = asyncHandler(async (req, res) => {
  return success(res, { user: authService.toPublicUser(req.user) }, "OK");
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  return success(res, null, "Password updated. Please log in again.");
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.requestPasswordReset(email);
  // Always return generic success
  return success(res, null, "If an account exists for that email, a reset link has been sent.");
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { userId, token, newPassword } = req.body;
  await authService.resetPassword({ userId, token, newPassword });
  return success(res, null, "Password has been reset. You can now sign in.");
});
