const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
});

const MovieSchema = mongoose.Schema(
  {
    rating: { type: String, required: true },
    poster: { type: String, required: true },
    background: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    trailer: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    genre: [{ type: String, required: true }],
    overview: { type: String, required: true },
    director: { type: String, required: true },
    cast: [
      {
        artist: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", MovieSchema);

module.exports = Movie;
