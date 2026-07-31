const mongoose = require("mongoose");

const UserTokenSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

module.exports = UserToken;
