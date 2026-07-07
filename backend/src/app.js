"use strict";

// ============================================================================
// Express application — wires up all middleware and routes.
// The HTTP server itself is started from src/server.js.
// ============================================================================

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { uploadRoot } = require("./services/upload.service");

const app = express();

// Trust proxy for correct client IP behind load balancers / Render / Vercel
app.set("trust proxy", 1);

// ---------- Security ----------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// ---------- CORS ----------
const corsOptions = {
  origin: function (origin, callback) {
    // Get the allowed origins from the env variable and split them into array 
    const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
      
    //Allow requests with no origin (like mobile apps)
    if (!origin) return callback (null, true);

    //check if the origin id in our allowed list
    const corsOrigins = process.env.CORS_ORIGINS || "";
    if (allowedOrigins.indexOf(origin) !== -1 || corOrigins.includes("*")) {
      callback (null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Disposition"],
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------- Parsing & compression ----------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(compression());

// ---------- Logging ----------
if (env.isDevelopment) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ---------- Rate limiting ----------
app.use(env.API_PREFIX, globalLimiter);

// ---------- Static uploads ----------
// Payment proofs are served publicly under /uploads/**.
// In production you may want to swap this for S3 / Cloudinary.
app.use(
  "/uploads",
  express.static(uploadRoot, {
    maxAge: "1d",
    etag: true,
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// ---------- API ----------
app.use(env.API_PREFIX, routes);

// ---------- Root ----------
app.get("/", (_req, res) => {
  res.json({
    name: "Diamond Body API",
    version: "1.0.0",
    apiPrefix: env.API_PREFIX,
    docs: "See README.md and API.md",
    health: `${env.API_PREFIX}/health`,
  });
});

// ---------- 404 & error handling (must be last) ----------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
