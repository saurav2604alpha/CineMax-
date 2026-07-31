const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyRefreshToken = (refreshToken) =>
  new Promise((resolve, reject) => {
    if (!refreshToken) return reject(new Error("No refresh token provided"));
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err) return reject(new Error("Invalid or expired refresh token"));
      resolve({ tokenDetails: decoded });
    });
  });

module.exports = verifyRefreshToken;
