const Movie = require("../models/movie.model");

const postMovie = async (req, res) => {
  try {
    const { title, poster, background, trailer="", releaseDate, duration, genre, overview, director="Unknown", cast=[], rating } = req.body;
    if (!title||!poster||!background||!releaseDate||!duration||!genre||!overview||!rating) return res.status(400).json({ message: "Missing required fields." });
    if (await Movie.findOne({ title })) return res.status(400).json({ message: "Movie already exists" });
    const genreArr = Array.isArray(genre) ? genre : genre.split(",").map(g=>g.trim()).filter(Boolean);
    const movie = await Movie.create({ title, poster, background, trailer, releaseDate, duration: Number(duration), genre: genreArr, overview, director, cast: Array.isArray(cast)?cast:[], rating: String(rating) });
    res.status(200).json({ message: "Movie created successfully", newMovie: movie });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const putMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await Movie.findById(id)) return res.status(400).json({ message: "Movie not found" });
    if (req.body.genre && typeof req.body.genre === "string") req.body.genre = req.body.genre.split(",").map(g=>g.trim()).filter(Boolean);
    if (req.body.duration) req.body.duration = Number(req.body.duration);
    if (req.body.rating) req.body.rating = String(req.body.rating);
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Movie edited successfully", updatedMovie });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await Movie.findById(id)) return res.status(400).json({ message: "Movie not found" });
    await Movie.findByIdAndDelete(id);
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

const getMovies = async (req, res) => {
  try { res.status(200).json(await Movie.find({})); }
  catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

module.exports = { postMovie, putMovie, deleteMovie, getMovies };
