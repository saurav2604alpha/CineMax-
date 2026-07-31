const mongoose = require("mongoose");

const TheaterSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    cinemaImg: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      mapUrl: { type: String, required: true },
    },
    amenities: [{ type: String, required: true }],
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    operatingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Theater = mongoose.model("Theater", TheaterSchema);

module.exports = Theater;
