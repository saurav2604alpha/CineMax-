const express = require("express");
const {
  postScreen,
  putScreen,
  deleteScreen,
  getScreen,
} = require("../controllers/screen.controller");

const router = express.Router();

router.post("/screen", postScreen);
router.put("/screen/:id", putScreen);
router.delete("/screen/:id", deleteScreen);
router.get("/screen", getScreen);

module.exports = router;
