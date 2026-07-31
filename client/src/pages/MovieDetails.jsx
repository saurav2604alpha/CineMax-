import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { toggleFavorite } from "../store/slices/bookingSlice";
import { DetailSkeleton } from "../components/ui/Skeleton";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState("about");

  const movies = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const theaters = useSelector(s => s.theater.theaters);
  const favorites = useSelector(s => s.booking.favorites);

  const movie = movies.find(m => String(m._id) === String(id));
  const isFav = favorites.includes(id);
  const movieShowtimes = showtimes.filter(s => String(s.movieId) === String(id));
  const isNowShowing = movieShowtimes.length > 0;

  const avgRating = movie?.reviews?.length
    ? (movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length).toFixed(1)
    : movie?.rating || "N/A";

  if (!movie) return <DetailSkeleton />;

  return (
    <div className="min-h-screen text-white pb-16">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={movie.background || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-20 left-4 lg:left-8 z-10 px-4 py-2 bg-black/50 hover:bg-black/80 rounded-full text-white text-sm backdrop-blur-sm transition-colors">← Back</button>
        {isNowShowing && <span className="absolute top-20 right-4 lg:right-8 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full shadow-lg">Now Showing</span>}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
            <div className="hidden md:block w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genre?.map(g => <span key={g} className="px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-xs rounded-full">{g}</span>)}
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-2">
                {movie.title} <span className="text-2xl font-normal text-gray-400">({new Date(movie.releaseDate).getFullYear()})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-5">
                <span className="text-yellow-400 font-semibold">⭐ {avgRating}/10</span>
                <span>⏱ {Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                <span>🎬 {movie.director}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {isNowShowing && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/movie/select/${movie._id}`)}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/40">
                    🎟️ Book Now
                  </motion.button>
                )}
                <button onClick={() => dispatch(toggleFavorite(movie._id))}
                  className={`px-5 py-3 border rounded-xl font-semibold transition-all ${isFav ? "bg-red-900/30 border-red-600/50 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                  {isFav ? "♥ Favorited" : "♡ Favorite"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800 mb-8">
          {["about", "showtimes", "reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "about" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              {movie.cast?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {movie.cast.map((c, i) => (
                      <div key={i} className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                        <p className="text-white font-medium text-sm">{c.artist}</p>
                        <p className="text-gray-400 text-xs mt-0.5">as {c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-fit">
              <h3 className="text-white font-bold mb-4">Movie Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Release Date", new Date(movie.releaseDate).toLocaleDateString("en-PH", { year:"numeric", month:"long", day:"numeric" })],
                  ["Duration", `${Math.floor(movie.duration/60)}h ${movie.duration%60}m`],
                  ["Director", movie.director],
                  ["Genre", movie.genre?.join(", ")],
                  ["Rating", `${movie.rating}/10`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-gray-400">{l}</span>
                    <span className="text-white text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "showtimes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!movieShowtimes.length ? (
              <div className="text-center py-16 text-gray-500"><p className="text-5xl mb-4">📅</p><p>No showtimes available yet.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movieShowtimes.map(s => {
                  const theater = theaters.find(t => String(t._id) === String(s.theaterId));
                  const remaining = (s.availableSeats || 0) - (s.bookedSeats?.length || 0);
                  return (
                    <motion.div key={s._id} whileHover={{ y: -2 }}
                      className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-red-800/50 transition-colors">
                      <p className="text-gray-400 text-sm">{new Date(s.date).toLocaleDateString("en-PH", { weekday:"short", month:"short", day:"numeric" })}</p>
                      <p className="text-white font-black text-2xl">{s.startTime}</p>
                      <p className="text-gray-400 text-sm mt-1">{s.hall}</p>
                      {theater && <p className="text-gray-500 text-xs mt-0.5">🏛️ {theater.name}</p>}
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-red-400 font-bold">₱{s.price}</span>
                          <p className={`text-xs mt-0.5 ${remaining <= 10 ? "text-yellow-400" : "text-green-400"}`}>{remaining} seats left</p>
                        </div>
                        <button onClick={() => navigate(`/booking/seat/${s._id}`)} disabled={remaining === 0}
                          className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${remaining === 0 ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
                          {remaining === 0 ? "Sold Out" : "Select"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!movie.reviews?.length ? (
              <div className="text-center py-16 text-gray-500"><p className="text-5xl mb-4">⭐</p><p>No reviews yet.</p></div>
            ) : (
              <div className="space-y-4">
                {movie.reviews.map((r, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">U</div>
                      <div>
                        <p className="text-white font-semibold">Verified Viewer</p>
                        <p className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                      </div>
                    </div>
                    {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
