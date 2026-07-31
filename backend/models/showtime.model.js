const mongoose = require("mongoose");

const ShowtimeSchema = mongoose.Schema(
  {
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hall: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookedSeats: [{ type: String }],
    price: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Showtime = mongoose.model("Showtime", ShowtimeSchema);

module.exports = Showtime;
