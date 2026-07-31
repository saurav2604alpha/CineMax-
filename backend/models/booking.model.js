const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    ticket: { type: [String], required: true },
    ticketPrice: { type: Number, required: true },
    addOns: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Concession" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
