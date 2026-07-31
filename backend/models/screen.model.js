const mongoose = require("mongoose");

const ScreenSchema = mongoose.Schema({
  name: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  screenType: { type: String, required: true },
  features: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
});

const Screen = mongoose.model("Screen", ScreenSchema);

module.exports = Screen;
