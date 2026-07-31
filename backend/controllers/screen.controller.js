const Screen = require("../models/screen.model");

const postScreen = async (req, res) => {
  try {
    const { name, seatingCapacity, screenType, features } = req.body;

    const screen = await Screen.findOne({ name });
    if (screen) {
      return res.status(400).json({ message: "Screen already exist" });
    }

    const newScreen = await Screen.create({
      name,
      seatingCapacity,
      screenType,
      features,
    });

    res.status(200).json({ message: "Screen created successfully", newScreen });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const putScreen = async (req, res) => {
  try {
    const { id } = req.params;

    const screen = await Screen.findById(id);
    if (!screen) {
      return res.status(400).json({ message: "Screen didn't exist" });
    }

    const updatedScreen = await Screen.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Screen updated successfully", updatedScreen });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteScreen = async (req, res) => {
  try {
    const { id } = req.params;

    const screen = await Screen.findById(id);
    if (!screen) {
      return res.status(400).json({ message: "Screen didn't exist" });
    }

    await Screen.findByIdAndDelete(id);

    res.status(200).json({ message: "Screen deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getScreen = async (req, res) => {
  try {
    const screens = await Screen.find({});

    if (!screens) {
      return;
    }

    res.status(200).json(screens);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postScreen, putScreen, deleteScreen, getScreen };
