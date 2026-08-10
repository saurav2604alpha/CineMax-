const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { connectToDatabase, getDatabaseState, getMissingEnvironmentVariables } = require("./config/database");
const { corsMiddleware } = require("./config/cors");

const authRoutes = require("./routes/auth.routes");
const refreshTokenRoutes = require("./routes/refreshToken.routes");
const movieRoutes = require("./routes/movie.routes");
const theaterRoutes = require("./routes/theater.routes");
const screenRoutes = require("./routes/screen.routes");
const showtimeRoutes = require("./routes/showtime.routes");
const concessionRoutes = require("./routes/concession.routes");
const bookingRoutes = require("./routes/booking.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(corsMiddleware);

app.get("/", (req, res) => {
  res.json({
    name: "CineMax API",
    status: "running",
    health: "/health",
  });
});

app.get("/health", async (req, res) => {
  const missing = getMissingEnvironmentVariables();
  if (missing.length) {
    return res.status(503).json({
      status: "configuration-error",
      database: getDatabaseState(),
      missing,
    });
  }

  try {
    await connectToDatabase();
    return res.json({
      status: "ok",
      database: getDatabaseState(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check database error:", error.message);
    return res.status(503).json({
      status: "degraded",
      database: getDatabaseState(),
      message: "Database connection failed",
    });
  }
});

// Every API route below this point requires valid configuration and a database.
app.use("/api", async (req, res, next) => {
  const missing = getMissingEnvironmentVariables();
  if (missing.length) {
    return res.status(503).json({
      message: "Backend environment is not configured",
      missing,
    });
  }

  try {
    await connectToDatabase();
    return next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(503).json({ message: "Database is unavailable" });
  }
});

app.post("/api/payment/process", (req, res) => {
  const { amount, cardName } = req.body;
  if (!amount || !cardName || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payment details." });
  }

  setTimeout(() => {
    res.json({
      success: true,
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      amount: Number(amount),
      message: "Payment processed successfully",
      paidAt: new Date().toISOString(),
    });
  }, 1500);
});

app.use("/api/auth", authRoutes);
app.use("/api/refreshToken", refreshTokenRoutes);
app.use("/api", movieRoutes);
app.use("/api", theaterRoutes);
app.use("/api", screenRoutes);
app.use("/api", showtimeRoutes);
app.use("/api", concessionRoutes);
app.use("/api", bookingRoutes);
app.use("/api", userRoutes);
app.use("/api", contactRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) console.error("Unhandled error:", error.stack || error.message);
  res.status(status).json({
    message: status === 500 ? "Internal server error" : error.message,
  });
});

module.exports = app;
