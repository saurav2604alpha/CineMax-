const cors = require("cors");

const normalizeOrigin = value => value.trim().replace(/\/$/, "");

const configuredOrigins = () => {
  const value = process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173";
  return new Set(value.split(",").map(normalizeOrigin).filter(Boolean));
};

const isAllowedOrigin = origin => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (configuredOrigins().has(normalized)) return true;

  if (process.env.NODE_ENV !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
  }

  return false;
};

const origin = (requestOrigin, callback) => {
  if (isAllowedOrigin(requestOrigin)) return callback(null, true);

  const error = new Error(`Origin ${requestOrigin} is not allowed by CORS`);
  error.status = 403;
  return callback(error);
};

const corsOptions = {
  origin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

module.exports = {
  corsMiddleware: cors(corsOptions),
  corsOptions,
  isAllowedOrigin,
};
