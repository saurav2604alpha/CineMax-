const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const http     = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// ── Required env validation ───────────────────────────────────────────────────
const required = ["MONGO_URL", "PORT", "ACCESS_TOKEN", "REFRESH_TOKEN"];
required.forEach(k => {
  if (!process.env[k]) { console.error(`❌  Missing env var: ${k}`); process.exit(1); }
});

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const refreshTokenRoutes = require("./routes/refreshToken.routes");
const movieRoutes        = require("./routes/movie.routes");
const theaterRoutes      = require("./routes/theater.routes");
const screenRoutes       = require("./routes/screen.routes");
const showtimeRoutes     = require("./routes/showtime.routes");
const concessionRoutes   = require("./routes/concession.routes");
const bookingRoutes      = require("./routes/booking.routes");
const userRoutes         = require("./routes/user.routes");
const contactRoutes      = require("./routes/contact.routes");

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ── Socket.io: Real-time seat locking ─────────────────────────────────────────
// { showtimeId: { seatLabel: { socketId, userId, lockedAt } } }
const lockedSeats = {};

io.on("connection", socket => {
  socket.on("join-showtime", ({ showtimeId }) => {
    socket.join(showtimeId);
    socket.emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] || {} });
  });

  socket.on("leave-showtime", ({ showtimeId }) => {
    socket.leave(showtimeId);
  });

  socket.on("lock-seat", ({ showtimeId, seat, userId }) => {
    if (!lockedSeats[showtimeId]) lockedSeats[showtimeId] = {};
    const existing = lockedSeats[showtimeId][seat];
    if (existing && existing.socketId !== socket.id) {
      socket.emit("seat-lock-denied", { seat });
      return;
    }
    lockedSeats[showtimeId][seat] = { socketId: socket.id, userId, lockedAt: Date.now() };
    io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
  });

  socket.on("unlock-seat", ({ showtimeId, seat }) => {
    if (lockedSeats[showtimeId]?.[seat]?.socketId === socket.id) {
      delete lockedSeats[showtimeId][seat];
      io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
    }
  });

  socket.on("disconnect", () => {
    Object.keys(lockedSeats).forEach(showtimeId => {
      let changed = false;
      Object.keys(lockedSeats[showtimeId] || {}).forEach(seat => {
        if (lockedSeats[showtimeId][seat].socketId === socket.id) {
          delete lockedSeats[showtimeId][seat];
          changed = true;
        }
      });
      if (changed) io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
    });
  });
});

// ── Dummy Payment Gateway ─────────────────────────────────────────────────────
app.post("/api/payment/process", (req, res) => {
  const { amount, cardName } = req.body;
  if (!amount || !cardName || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payment details." });
  }
  // Simulate 1.5s processing delay
  setTimeout(() => {
    const transactionId = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
    res.json({
      success: true,
      transactionId,
      amount: Number(amount),
      message: "Payment processed successfully",
      paidAt: new Date().toISOString(),
    });
  }, 1500);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth/",         authRoutes);
app.use("/api/refreshToken/", refreshTokenRoutes);
app.use("/api/",              movieRoutes);
app.use("/api/",              theaterRoutes);
app.use("/api/",              screenRoutes);
app.use("/api/",              showtimeRoutes);
app.use("/api/",              concessionRoutes);
app.use("/api/",              bookingRoutes);
app.use("/api/",              userRoutes);
app.use("/api/",              contactRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Connect DB then Start ─────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(Number(process.env.PORT), () => {
      console.log(`🚀 Server  → http://localhost:${process.env.PORT}`);
      console.log(`📡 Socket  → ws://localhost:${process.env.PORT}`);
      console.log(`💳 Payment → http://localhost:${process.env.PORT}/api/payment/process`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = { io };
