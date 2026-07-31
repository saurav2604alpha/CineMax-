const Theater = require("../models/theater.model");

const postTheater = async (req, res) => {
  try {
    const { name, cinemaImg="https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800", location={ address:"TBD", city:"Manila", mapUrl:"https://maps.google.com" }, amenities=[], contact={ phone:"N/A", email:"info@cinemax.ph" }, operatingHours={ open:"10:00 AM", close:"11:00 PM" } } = req.body;
    if (!name) return res.status(400).json({ message: "Theater name is required." });
    if (await Theater.findOne({ name })) return res.status(400).json({ message: "Theater already exists" });
    const newTheater = await Theater.create({ name, cinemaImg, location, amenities, contact, operatingHours });
    res.status(200).json({ message: "Theater created successfully", newTheater });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const putTheater = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await Theater.findById(id)) return res.status(400).json({ message: "Theater not found" });
    const updatedTheater = await Theater.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Theater updated successfully", updatedTheater });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await Theater.findById(id)) return res.status(400).json({ message: "Theater not found" });
    await Theater.findByIdAndDelete(id);
    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const getTheater = async (req, res) => {
  try { res.status(200).json(await Theater.find({})); }
  catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

module.exports = { postTheater, putTheater, deleteTheater, getTheater };
