const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please refresh." });
    }
    return res.status(403).json({ message: "Invalid token." });
  }
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      const User = require("../models/user.model");
      const user = await User.findById(req.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required." });
      }
      next();
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });
};

module.exports = { authMiddleware, adminMiddleware };
