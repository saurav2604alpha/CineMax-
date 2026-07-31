import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBannerSkeleton } from "../ui/Skeleton";

const HeroBanner = () => {
  const navigate  = useNavigate();
  const [cur, setCur] = useState(0);
  const movies    = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);

  // Only feature movies that are currently showing
  const featured = movies
    .filter(m => m.background && showtimes.some(s => String(s.movieId) === String(m._id)))
    .slice(0, 5);

  // Fallback to any movie with a background if none are showing
  const display = featured.length > 0
    ? featured
    : movies.filter(m => m.background).slice(0, 5);

  useEffect(() => {
    if (!display.length) return;
    const t = setTimeout(() => setCur(p => (p + 1) % display.length), 6000);
    return () => clearTimeout(t);
  }, [cur, display.length]);

  if (!movies.length) return <HeroBannerSkeleton />;
  if (!display.length) return null;

  const movie = display[cur];
  const isShowing = showtimes.some(s => String(s.movieId) === String(movie._id));

  return (
    <div className="relative w-full h-[88vh] overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie._id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
        >
          <img src={movie.background} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre?.slice(0, 3).map(g => (
                  <span key={g} className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-medium rounded-full">
                    {g}
                  </span>
                ))}
                {isShowing && (
                  <span className="px-3 py-1 bg-green-600/20 border border-green-500/40 text-green-400 text-xs font-bold rounded-full">
                    Now Showing
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-3 drop-shadow-2xl">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-yellow-400 font-semibold">⭐ {movie.rating}</span>
                <span className="text-gray-300">
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span className="text-gray-400">{new Date(movie.releaseDate).getFullYear()}</span>
              </div>

              <p className="text-gray-300 text-lg mb-8 line-clamp-2 max-w-xl">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                {isShowing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/movie/select/${movie._id}`)}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-red-900/50 transition-colors"
                  >
                    🎟️ Book Now
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/movie/details/${movie._id}`)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl text-lg border border-white/20 transition-colors"
                >
                  ℹ️ More Info
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      {display.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              className={`transition-all duration-300 h-1.5 rounded-full ${i === cur ? "bg-red-500 w-8" : "bg-white/40 w-4 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}

      {/* Nav arrows */}
      {display.length > 1 && (
        <>
          <button
            onClick={() => setCur(p => p === 0 ? display.length - 1 : p - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white text-2xl flex items-center justify-center transition-colors"
          >‹</button>
          <button
            onClick={() => setCur(p => (p + 1) % display.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white text-2xl flex items-center justify-center transition-colors"
          >›</button>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
