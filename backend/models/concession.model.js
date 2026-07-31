const mongoose = require("mongoose");

const ConcessionSchema = mongoose.Schema(
  {
    photo: { type: String, required: true },
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Concession = mongoose.model("Concession", ConcessionSchema);

module.exports = Concession;
