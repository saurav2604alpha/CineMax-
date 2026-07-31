const express = require("express");
const {
  postTheater,
  putTheater,
  deleteTheater,
  getTheater,
} = require("../controllers/theater.controller");

const router = express.Router();

router.post("/theater", postTheater);
router.put("/theater/:id", putTheater);
router.delete("/theater/:id", deleteTheater);
router.get("/theater", getTheater);

module.exports = router;
