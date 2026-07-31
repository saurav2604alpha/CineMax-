import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const MovieShowtimesPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const movies    = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const theaters  = useSelector(s => s.theater.theaters);

  const movie = movies.find(m => String(m._id) === String(id));
  // BUG FIX: compare as strings since Redux stores plain objects from JSON
  const movieShowtimes = showtimes.filter(s => String(s.movieId) === String(id));

  const grouped = movieShowtimes.reduce((acc, s) => {
    const key = new Date(s.date).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  if (!movie) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-5xl mb-4">🎬</p>
        <p className="text-gray-400 text-lg">Movie not found.</p>
        <button onClick={() => navigate("/movies")} className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">Browse Movies</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-16">
      {/* Movie banner */}
      <div className="relative h-52 overflow-hidden mb-8">
        <img src={movie.background || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 px-4 py-2 bg-black/60 hover:bg-black/90 text-white text-sm rounded-full backdrop-blur-sm transition-colors">← Back</button>
        <div className="absolute bottom-4 left-4 lg:left-8">
          <h1 className="text-3xl font-black text-white drop-shadow-lg">{movie.title}</h1>
          <p className="text-gray-300 text-sm mt-1">Select a showtime to book your seats</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {!sortedDates.length ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-xl font-semibold text-gray-400 mb-2">No showtimes available</p>
            <p className="text-sm">This movie has no scheduled screenings yet.</p>
            <button onClick={() => navigate("/movies")} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">Browse Other Movies</button>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedDates.map((dateKey, di) => (
              <motion.div key={dateKey} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: di*0.07 }}>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                  <span className="w-2 h-7 bg-red-600 rounded-full flex-shrink-0" />
                  {new Date(dateKey).toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[dateKey].map(s => {
                    const theater  = theaters.find(t => String(t._id) === String(s.theaterId));
                    const remaining = (s.availableSeats||0) - (s.bookedSeats?.length||0);
                    const pct       = s.availableSeats>0 ? ((s.bookedSeats?.length||0)/s.availableSeats)*100 : 0;

                    return (
                      <motion.div key={s._id} whileHover={{ y:-2 }}
                        className="bg-gray-900 rounded-xl border border-gray-800 hover:border-red-800/60 overflow-hidden transition-all">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-black text-2xl">{s.startTime}</p>
                              {s.endTime && <p className="text-gray-500 text-xs">until {s.endTime}</p>}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              remaining===0 ? "bg-red-900/40 text-red-400 border-red-800/40" :
                              remaining<=15 ? "bg-yellow-900/40 text-yellow-400 border-yellow-800/40" :
                              "bg-green-900/40 text-green-400 border-green-800/40"
                            }`}>
                              {remaining===0 ? "Sold Out" : remaining<=15 ? `${remaining} left!` : "Available"}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">{s.hall}</p>
                          {theater && <p className="text-gray-500 text-xs mt-0.5">🏛️ {theater.name}</p>}

                          {/* Fill bar */}
                          <div className="mt-3 mb-4">
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${pct>80?"bg-red-500":pct>50?"bg-yellow-500":"bg-green-500"}`}
                                style={{ width:`${pct}%` }} />
                            </div>
                            <p className="text-gray-600 text-xs mt-1">{remaining} / {s.availableSeats} seats available</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-red-400 font-black text-xl">₱{s.price}</span>
                            <motion.button
                              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                              onClick={() => navigate(`/booking/seat/${s._id}`)}
                              disabled={remaining===0}
                              className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-colors shadow-md ${
                                remaining===0 ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-red-900/30"
                              }`}>
                              {remaining===0 ? "Full" : "Select Seats"}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieShowtimesPage;
