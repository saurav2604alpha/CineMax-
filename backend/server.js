const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { connectToDatabase, getMissingEnvironmentVariables } = require("./config/database");
const { corsOptions } = require("./config/cors");

const PORT = Number(process.env.PORT || 8080);
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

// In-memory locks are useful for the long-running local Node server. Confirmed
// bookings are still protected by the database-level checks in the API.
const lockedSeats = {};

io.on("connection", socket => {
  socket.on("join-showtime", ({ showtimeId }) => {
    if (!showtimeId) return;
    socket.join(showtimeId);
    socket.emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] || {} });
  });

  socket.on("leave-showtime", ({ showtimeId }) => {
    if (showtimeId) socket.leave(showtimeId);
  });

  socket.on("lock-seat", ({ showtimeId, seat, userId }) => {
    if (!showtimeId || !seat) return;
    if (!lockedSeats[showtimeId]) lockedSeats[showtimeId] = {};

    const existing = lockedSeats[showtimeId][seat];
    if (existing && existing.socketId !== socket.id) {
      socket.emit("seat-lock-denied", { seat });
      return;
    }

    lockedSeats[showtimeId][seat] = {
      socketId: socket.id,
      userId,
      lockedAt: Date.now(),
    };
    io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
  });

  socket.on("unlock-seat", ({ showtimeId, seat }) => {
    if (lockedSeats[showtimeId]?.[seat]?.socketId !== socket.id) return;
    delete lockedSeats[showtimeId][seat];
    io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
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
      if (changed) {
        io.to(showtimeId).emit("seats-updated", { lockedSeats: lockedSeats[showtimeId] });
      }
    });
  });
});

const startServer = async () => {
  const missing = getMissingEnvironmentVariables();
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  await connectToDatabase();
  server.listen(PORT, () => {
    console.log(`CineMax API listening on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch(error => {
    console.error("Unable to start CineMax API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, server, io, startServer };
