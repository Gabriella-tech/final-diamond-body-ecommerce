"use strict";

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

// Ensure the uploads folder exists at boot.
const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
const proofsDir = path.join(uploadRoot, "payment-proofs");
for (const dir of [uploadRoot, proofsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(ApiError.badRequest("Only JPG, PNG, WEBP or PDF files are allowed"));
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, proofsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".bin";
    const safe = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024, files: 1 },
});

/**
 * Build a public URL for a stored payment proof file.
 * Files are served by Express as static under /uploads/**.
 */
function paymentProofPublicUrl(filename) {
  return `/uploads/payment-proofs/${filename}`;
}

function deleteFileByUrl(publicUrl) {
  if (!publicUrl || typeof publicUrl !== "string") return;
  if (!publicUrl.startsWith("/uploads/")) return;
  const abs = path.resolve(process.cwd(), publicUrl.replace(/^\//, ""));
  fs.promises.unlink(abs).catch(() => {});
}

module.exports = {
  uploadPaymentProof,
  paymentProofPublicUrl,
  deleteFileByUrl,
  uploadRoot,
};
