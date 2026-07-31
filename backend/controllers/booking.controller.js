const Booking    = require("../models/booking.model");
const Concession = require("../models/concession.model");
const Showtime   = require("../models/showtime.model");
const Movie      = require("../models/movie.model");
const User       = require("../models/user.model");
const mongoose   = require("mongoose");

let emailService = null;
try { emailService = require("../services/email.service"); } catch (_) {}

/* ─── Create Booking ──────────────────────────────────────────────────────── */
const postBooking = async (req, res) => {
  try {
    const { showtimeId, ticket, ticketPrice, addOns, totalAmount, transactionId } = req.body;
    const { id: userId } = req.params;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!showtimeId || !ticket?.length || ticketPrice == null || !totalAmount || !transactionId) {
      return res.status(400).json({
        message: "Missing required fields: showtimeId, ticket, ticketPrice, totalAmount, transactionId",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).json({ message: "Invalid showtimeId." });
    }

    // ── Verify showtime exists ───────────────────────────────────────────────
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: "Showtime not found." });

    // ── Prevent duplicate seat booking (race condition guard) ────────────────
    const alreadyBooked = ticket.filter(s => showtime.bookedSeats.includes(s));
    if (alreadyBooked.length) {
      return res.status(409).json({
        message: `Seat(s) ${alreadyBooked.join(", ")} are already booked. Please choose different seats.`,
      });
    }

    // ── Process concessions ──────────────────────────────────────────────────
    const concessionResults = [];
    for (const addOn of (addOns || [])) {
      // Safely cast id to ObjectId string for lookup
      const addOnId = addOn.id ? String(addOn.id) : null;
      if (!addOnId || !mongoose.Types.ObjectId.isValid(addOnId)) continue;

      const concession = await Concession.findById(addOnId);
      if (!concession) {
        return res.status(404).json({ message: `Concession item not found: ${addOnId}` });
      }
      if (concession.stock < addOn.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${concession.name}" (available: ${concession.stock}).`,
        });
      }
      concession.stock -= addOn.quantity;
      await concession.save();
      concessionResults.push(concession);
    }

    // ── Create booking document ──────────────────────────────────────────────
    const safeAddOns = (addOns || [])
      .filter(a => a.id && mongoose.Types.ObjectId.isValid(String(a.id)))
      .map(a => ({
        id:         new mongoose.Types.ObjectId(String(a.id)),
        name:       a.name,
        price:      Number(a.price),
        quantity:   Number(a.quantity),
        totalPrice: Number(a.price) * Number(a.quantity),
      }));

    const booking = await new Booking({
      showtimeId:      new mongoose.Types.ObjectId(showtimeId),
      userId:          new mongoose.Types.ObjectId(userId),
      ticket:          ticket,
      ticketPrice:     Number(ticketPrice),
      addOns:          safeAddOns,
      totalAmount:     Number(totalAmount),
      paymentIntentId: transactionId,
      status:          "Paid",
      paymentStatus:   "Card",
    }).save();

    // ── Update showtime: push booked seats ───────────────────────────────────
    const updatedShowtime = await Showtime.findByIdAndUpdate(
      showtimeId,
      { $push: { bookedSeats: { $each: ticket } } },
      { new: true }
    );

    // ── Optional: email confirmation ─────────────────────────────────────────
    if (emailService) {
      try {
        const [user, movie] = await Promise.all([
          User.findById(userId),
          Movie.findById(showtime.movieId),
        ]);
        if (user?.email && movie) {
          emailService.sendBookingConfirmation({
            to: user.email, name: `${user.firstName} ${user.lastName}`,
            bookingId: booking._id, movieTitle: movie.title,
            seats: ticket, date: showtime.date,
            startTime: showtime.startTime, hall: showtime.hall,
            totalAmount,
          }).catch(() => {});
        }
      } catch (_) {}
    }

    return res.status(201).json({
      message:           "Booking confirmed! 🎬",
      newBooking:        booking,
      updatedConcession: concessionResults,
      updatedShowtime,
    });
  } catch (error) {
    console.error("postBooking error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ─── Refund Booking ──────────────────────────────────────────────────────── */
const refundBooking = async (req, res) => {
  try {
    const { showtimeId, ticket, addOns, bookingId } = req.body;
    const { id: userId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId." });
    }

    const userBooking = await Booking.findOne({ _id: bookingId, userId });
    if (!userBooking) return res.status(403).json({ message: "Not authorized to refund this booking." });
    if (userBooking.status === "Refunded") return res.status(400).json({ message: "Booking is already refunded." });

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId, { status: "Refunded" }, { new: true }
    );

    let updatedShowtime = null;
    if (showtimeId && mongoose.Types.ObjectId.isValid(showtimeId)) {
      const showtime = await Showtime.findById(showtimeId);
      if (showtime) {
        showtime.bookedSeats = showtime.bookedSeats.filter(s => !(ticket || []).includes(s));
        updatedShowtime = await showtime.save();
      }
    }

    const concessionResults = [];
    for (const addOn of (addOns || [])) {
      const addOnId = addOn.id ? String(addOn.id) : null;
      if (!addOnId || !mongoose.Types.ObjectId.isValid(addOnId)) continue;
      const c = await Concession.findById(addOnId);
      if (c) { c.stock += Number(addOn.quantity); await c.save(); concessionResults.push(c); }
    }

    return res.status(200).json({
      message:           "Refund processed successfully!",
      updatedBooking,
      updatedShowtime,
      updatedConcession: concessionResults,
    });
  } catch (error) {
    console.error("refundBooking error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ─── Get All Bookings ────────────────────────────────────────────────────── */
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ─── Get User Bookings ───────────────────────────────────────────────────── */
const getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    const bookings = await Booking.find({ userId: id }).sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ─── Rate Booking ────────────────────────────────────────────────────────── */
const rateBooking = async (req, res) => {
  try {
    const { bookingId, rating, movieId, comment } = req.body;
    const { id: userId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });

    const alreadyReviewed = movie.reviews.some(
      r => r.userId?.toString() === userId && r.bookingId?.toString() === bookingId
    );
    if (alreadyReviewed) return res.status(400).json({ message: "You have already reviewed this booking." });

    movie.reviews.push({ bookingId, movieId, userId, rating: Number(rating), comment });
    const updatedMovie = await movie.save();

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId, { isReviewed: true }, { new: true }
    );

    return res.status(201).json({ message: "Review submitted!", updatedMovie, updatedBooking });
  } catch (error) {
    console.error("rateBooking error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postBooking, getBookings, getUserBookings, refundBooking, rateBooking };
