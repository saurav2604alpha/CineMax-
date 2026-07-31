const express = require("express");
const {
  postBooking,
  getBookings,
  getUserBookings,
  refundBooking,
  rateBooking,
} = require("../controllers/booking.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/booking", getBookings);
router.get("/booking/user/:id", authMiddleware, getUserBookings);
router.post("/booking/:id", authMiddleware, postBooking);
router.post("/booking-refund/:id", authMiddleware, refundBooking);
router.put("/booking/:id", authMiddleware, rateBooking);

module.exports = router;
