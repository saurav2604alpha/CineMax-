const Showtime = require("../models/showtime.model");

const postShowtime = async (req, res) => {
  try {
    const {
      screenId,
      movieId,
      theaterId,
      hall,
      date,
      availableSeats,
      price,
      times,
    } = req.body;

    const showtimeResults = [];

    for (let time of times) {
      const { startTime, endTime } = time;

      // const showtimeExist = await Showtime.findOne({
      //   movieId,
      //   screenId,
      //   theaterId,
      //   startTime,
      //   hall,
      // });

      // if (showtimeExist) {
      //   return res.status(400).json({ message: "Showtime already exist" });
      // }

      const showtime = new Showtime({
        screenId,
        movieId,
        theaterId,
        date,
        hall,
        price: parseInt(price),
        availableSeats: parseInt(availableSeats),
        startTime,
        endTime,
      });

      const newShowtime = await showtime.save();

      showtimeResults.push(newShowtime);
    }

    res.status(200).json({
      message: "Showtimes created successfully",
      newShowtimes: showtimeResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find({});

    if (!showtimes) return;

    res.status(200).json(showtimes);
  } catch (error) {}
};

module.exports = { postShowtime, getShowtimes };
