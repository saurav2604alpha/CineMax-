const Concession = require("../models/concession.model");

const postConcession = async (req, res) => {
  try {
    const { photo, name, stock, price } = req.body;
    const existingConcession = await Concession.findOne({ name });
    if (existingConcession) {
      return res.status(400).json({ message: "Concession already exist" });
    }

    const concession = await Concession.create({ photo, name, stock, price });

    res.status(200).json({
      message: "Concessioncreated successfully",
      newConcession: concession,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const putConcession = async (req, res) => {
  try {
    const { id } = req.params;

    const concession = await Concession.findById(id);
    if (!concession) {
      return res.status(400).json({ message: "Concession not found" });
    }

    const updatedConcession = await Concession.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Concession edited successfully", updatedConcession });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteConcession = async (req, res) => {
  try {
    const { id } = req.params;

    const concession = await Concession.findById(id);
    if (!concession) {
      return res.status(400).json({ message: "Concession not found" });
    }

    await Concession.findByIdAndDelete(id);

    res.status(200).json({ message: "Concession deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getConcessions = async (req, res) => {
  try {
    const concessions = await Concession.find({});

    if (!concessions) return;

    res.status(200).json(concessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const changeStock = async (req, res) => {
  try {
    const { stock, type } = req.body;
    const { id } = req.params;

    if (typeof stock !== "number") {
      return res
        .status(400)
        .json({ message: "Stock must be a positive number" });
    }

    const concession = await Concession.findById(id);
    if (!concession) {
      return res.status(400).json({ message: "Concession not found" });
    }

    let updatedStock = concession.stock;
    if (type === "add") {
      updatedStock += stock;
    } else if (type === "subtract") {
      if (updatedStock < stock) {
        return res
          .status(400)
          .json({ message: "Cannot subtract more than available stock" });
      }

      updatedStock -= stock;
    } else {
      return res.status(400).json({ message: "Invalid stock operation type" });
    }

    concession.stock = updatedStock;
    await concession.save();

    res.status(200).json({ message: "Stock updated", concession });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  postConcession,
  putConcession,
  deleteConcession,
  getConcessions,
  changeStock,
};
