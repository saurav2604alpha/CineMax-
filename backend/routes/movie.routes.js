const express = require("express");
const {
  postMovie,
  putMovie,
  deleteMovie,
  getMovies,
} = require("../controllers/movie.controller");

const router = express.Router();

router.post("/movie", postMovie);
router.put("/movie/:id", putMovie);
router.delete("/movie/:id", deleteMovie);
router.get("/movie", getMovies);

module.exports = router;
