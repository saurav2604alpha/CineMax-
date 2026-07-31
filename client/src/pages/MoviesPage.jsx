import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import MovieCard from "../components/homepage/MovieCard";
import { MovieGridSkeleton } from "../components/ui/Skeleton";

const GENRES = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Adventure", "Family"];

const MoviesPage = () => {
  const movies = useSelector(s => s.movie.movies);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let r = [...movies];
    if (search) r = r.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.overview?.toLowerCase().includes(search.toLowerCase()));
    if (genre !== "All") r = r.filter(m => m.genre?.includes(genre));
    if (sort === "newest") r.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    else if (sort === "oldest") r.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    else if (sort === "rating") r.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    else if (sort === "az") r.sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [movies, search, genre, sort]);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-16">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4 mb-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white">All <span className="text-red-500">Movies</span></h1>
          <p className="text-gray-400 mt-2">{movies.length} movies available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..."
              className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="az">A → Z</option>
          </select>
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${genre === g ? "bg-red-600 border-red-600 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
        {!movies.length ? <MovieGridSkeleton count={12} /> : !filtered.length ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No movies match your search.</p>
            <button onClick={() => { setSearch(""); setGenre("All"); }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 text-sm">Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {filtered.map((movie, i) => (
                <motion.div key={movie._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
