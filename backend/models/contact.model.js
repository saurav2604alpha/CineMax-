const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "General Inquiry" },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
