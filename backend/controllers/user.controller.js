const User = require("../models/user.model");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) return;

    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers };
