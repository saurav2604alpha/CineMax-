import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toggleFavorite } from "../../store/slices/bookingSlice";

const MovieCard = ({ movie, showBook = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const favorites = useSelector(s => s.booking.favorites);
  const isFav = favorites.map(String).includes(String(movie._id));

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}
      className="bg-gray-900 rounded-xl overflow-hidden group cursor-pointer border border-gray-800 hover:border-red-800/60 transition-colors">
      <div className="relative overflow-hidden aspect-[2/3]" onClick={() => navigate(`/movie/details/${movie._id}`)}>
        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs font-bold text-yellow-400">⭐ {movie.rating}</div>
        <button onClick={e => { e.stopPropagation(); dispatch(toggleFavorite(movie._id)); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 transition-colors">
          <span className={`text-lg ${isFav ? "text-red-500" : "text-gray-400"}`}>{isFav ? "♥" : "♡"}</span>
        </button>
        {showBook && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={e => { e.stopPropagation(); navigate(`/movie/select/${movie._id}`); }}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
              🎟️ Book Now
            </button>
          </div>
        )}
      </div>
      <div className="p-3" onClick={() => navigate(`/movie/details/${movie._id}`)}>
        <h3 className="font-bold text-white text-sm line-clamp-1">{movie.title}</h3>
        <p className="text-gray-400 text-xs mt-1">{movie.genre?.slice(0, 2).join(" · ")}</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {Math.floor(movie.duration / 60)}h {movie.duration % 60}m · {new Date(movie.releaseDate).getFullYear()}
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
