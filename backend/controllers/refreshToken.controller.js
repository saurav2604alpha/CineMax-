const verifyRefreshToken = require("../utils/verifyRefreshToken");
const { refreshTokenBodyValidation } = require("../utils/validationSchema");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const newToken = async (req, res) => {
  const body = { refreshToken: req.body.refreshToken || req.body.token };
  const { error } = refreshTokenBodyValidation(body);
  if (error) return res.status(400).json({ error: true, message: error.details[0].message });
  try {
    const { tokenDetails } = await verifyRefreshToken(body.refreshToken);
    const userId = tokenDetails.userId || tokenDetails._id;
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
    res.status(200).json({ error: false, accessToken, message: "Access token created successfully" });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message || "Failed to verify refresh token" });
  }
};

const logout = async (req, res) => {
  try {
    const UserToken = require("../models/userToken.model");
    const token = req.body.refreshToken || req.body.token;
    if (token) await UserToken.deleteOne({ token });
    res.status(200).json({ error: false, message: "Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { newToken, logout };
