import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import { MovieGridSkeleton } from "../ui/Skeleton";

export const NowShowingSection = () => {
  const movies    = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);

  // BUG FIX: use String comparison to avoid ObjectId vs string mismatch
  const nowShowing = movies
    .filter(m => showtimes.some(s => String(s.movieId) === String(m._id)))
    .slice(0, 8);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white">Now <span className="text-red-500">Showing</span></h2>
          <p className="text-gray-400 mt-1">Book your seats before they fill up</p>
        </div>
        <Link to="/movies" className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors">
          See all →
        </Link>
      </div>

      {!movies.length ? (
        <MovieGridSkeleton count={8} />
      ) : !nowShowing.length ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-lg">No movies currently showing.</p>
          <p className="text-sm mt-1">Run <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">npm run seed</code> in the backend to add movies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
          {nowShowing.map((movie, i) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export const ComingSoonSection = () => {
  const movies    = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);

  const coming = movies
    .filter(m =>
      !showtimes.some(s => String(s.movieId) === String(m._id)) &&
      new Date(m.releaseDate) > new Date()
    )
    .slice(0, 4);

  if (!coming.length) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto border-t border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white">Coming <span className="text-red-500">Soon</span></h2>
          <p className="text-gray-400 mt-1">Movies arriving in theaters soon</p>
        </div>
        <Link to="/movies" className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
        {coming.map((movie, i) => (
          <motion.div
            key={movie._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <MovieCard movie={movie} showBook={false} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
