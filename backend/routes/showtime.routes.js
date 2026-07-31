const express = require("express");
const {
  postShowtime,
  getShowtimes,
} = require("../controllers/showtime.controller");

const router = express.Router();

router.post("/showtime", postShowtime);
router.get("/showtime", getShowtimes);

module.exports = router;
