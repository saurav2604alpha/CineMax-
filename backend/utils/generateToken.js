const jwt = require("jsonwebtoken");
const UserToken = require("../models/userToken.model");
require("dotenv").config();

const generateToken = async (userId) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    const userToken = await UserToken.findOne({ userId });
    if (userToken) await UserToken.deleteOne({ userId });

    await new UserToken({ userId, token: refreshToken }).save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = generateToken;
