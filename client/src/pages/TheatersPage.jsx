import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TheatersPage = () => {
  const navigate = useNavigate();
  const theaters = useSelector(s => s.theater.theaters);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies = useSelector(s => s.movie.movies);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-16">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4 mb-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white">Our <span className="text-red-500">Theaters</span></h1>
          <p className="text-gray-400 mt-2">Find your nearest CineMax location</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {!theaters.length ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🏛️</p>
            <p className="text-xl">No theaters found. Please run the seed script.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {theaters.map((theater, idx) => {
              const theaterShowtimes = showtimes.filter(s => String(s.theaterId) === String(theater._id));
              const movieIds = [...new Set(theaterShowtimes.map(s => s.movieId))];
              const nowShowing = movies.filter(m => movieIds.map(String).includes(String(m._id)));

              return (
                <motion.div key={theater._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  {/* Banner */}
                  <div className="relative h-52 overflow-hidden">
                    <img src={theater.cinemaImg} alt={theater.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <h2 className="text-2xl font-black text-white">{theater.name}</h2>
                      <p className="text-gray-300 text-sm mt-1">📍 {theater.location?.address}, {theater.location?.city}</p>
                    </div>
                    {theater.isActive && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">Open</span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Info */}
                      <div className="space-y-3">
                        <h3 className="text-white font-semibold mb-2">Theater Info</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>🕐</span>
                          <span>{theater.operatingHours?.open} – {theater.operatingHours?.close}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>📞</span><span>{theater.contact?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>📧</span><span>{theater.contact?.email}</span>
                        </div>
                        {theater.location?.mapUrl && (
                          <a href={theater.location.mapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
                            🗺️ View on Map →
                          </a>
                        )}
                      </div>

                      {/* Amenities */}
                      <div>
                        <h3 className="text-white font-semibold mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {theater.amenities?.map(a => (
                            <span key={a} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-full">{a}</span>
                          ))}
                        </div>
                      </div>

                      {/* Now Showing here */}
                      <div>
                        <h3 className="text-white font-semibold mb-3">Now Showing ({nowShowing.length})</h3>
                        {!nowShowing.length ? (
                          <p className="text-gray-500 text-sm">No showtimes scheduled.</p>
                        ) : (
                          <div className="space-y-2">
                            {nowShowing.slice(0, 3).map(movie => (
                              <div key={movie._id} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/movie/details/${movie._id}`)}>
                                <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 ring-red-500 transition-all" />
                                <div>
                                  <p className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">{movie.title}</p>
                                  <p className="text-gray-400 text-xs">{movie.genre?.slice(0, 2).join(" · ")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Showtimes preview */}
                    {theaterShowtimes.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <h3 className="text-white font-semibold mb-4">Today's Schedule</h3>
                        <div className="flex flex-wrap gap-3">
                          {theaterShowtimes.slice(0, 6).map(s => {
                            const movie = movies.find(m => String(m._id) === String(s.movieId));
                            return (
                              <button key={s._id} onClick={() => navigate(`/booking/seat/${s._id}`)}
                                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-red-700/50 rounded-xl px-4 py-3 transition-all group">
                                {movie?.poster && <img src={movie.poster} alt="" className="w-8 h-10 object-cover rounded" />}
                                <div className="text-left">
                                  <p className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">{movie?.title}</p>
                                  <p className="text-gray-400 text-xs">{s.startTime} · {s.hall}</p>
                                  <p className="text-red-400 text-xs font-semibold">₱{s.price}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheatersPage;
