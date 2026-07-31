import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { authLogout }        from "../store/slices/storageSlice";
import { toEditBooking }     from "../store/slices/bookingSlice";
import { toEditShowtime }    from "../store/slices/showtimeSlice";
import { toUpdateStock }     from "../store/slices/concessionSlice";
import { bookingsAPI }       from "../api";

const STATUS_STYLE = {
  Paid:     "bg-green-900/40 text-green-400 border-green-700/40",
  Refunded: "bg-gray-800 text-gray-400 border-gray-700",
  Pending:  "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
};

/* ─── Rate Booking Modal ─────────────────────────────────────────────────── */
const RateModal = ({ booking, showtime, movie, onClose, onRated }) => {
  const dispatch = useDispatch();
  const userId   = useSelector(s => s.storage.userId);
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsAPI.rate(userId, {
        bookingId: booking._id,
        movieId:   showtime.movieId,
        rating,
        comment,
      });
      dispatch(toEditBooking({ bookingId: booking._id, updatedData: data.updatedBooking }));
      toast.success("Review submitted! ⭐");
      onRated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-white font-bold text-lg">Rate Your Experience</h3>
            <p className="text-gray-400 text-sm mt-0.5">{movie?.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Star selector */}
        <div className="flex justify-center gap-3 mb-5">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              className={`text-4xl transition-transform hover:scale-125 ${s <= rating ? "text-yellow-400" : "text-gray-700"}`}>
              ★
            </button>
          ))}
        </div>
        <p className="text-center text-gray-400 text-sm mb-4">
          {["","Poor","Fair","Good","Great","Excellent!"][rating]}
        </p>

        <textarea value={comment} onChange={e => setComment(e.target.value)}
          rows={3} placeholder="Share your thoughts (optional)..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 resize-none mb-4" />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Main Profile Page ──────────────────────────────────────────────────── */
const UserProfilePage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [tab, setTab]           = useState("bookings");
  const [refunding, setRefunding] = useState(null);
  const [rateModal, setRateModal] = useState(null);

  const userId    = useSelector(s => s.storage.userId);
  const users     = useSelector(s => s.user.users);
  const bookings  = useSelector(s => s.booking.bookings);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies    = useSelector(s => s.movie.movies);
  const favorites = useSelector(s => s.booking.favorites);
  const allMovies = useSelector(s => s.movie.movies);

  const user       = users.find(u => String(u._id) === String(userId));
  const myBookings = bookings.filter(b => b.userId === userId);
  const favMovies  = allMovies.filter(m => favorites.includes(m._id));

  if (!userId) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
        <button onClick={() => navigate("/login")}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
          Sign In
        </button>
      </div>
    </div>
  );

  const handleRefund = async (booking) => {
    if (!window.confirm(`Cancel booking for "${movies.find(m => m._id === showtimes.find(s => String(s._id) === String(booking.showtimeId))?.movieId)?.title}"? This action cannot be undone.`)) return;
    setRefunding(booking._id);
    try {
      const { data } = await bookingsAPI.refund(userId, {
        bookingId:  booking._id,
        showtimeId: booking.showtimeId,
        ticket:     booking.ticket,
        addOns:     booking.addOns || [],
      });
      dispatch(toEditBooking({ bookingId: booking._id, updatedData: data.updatedBooking }));
      if (data.updatedShowtime) {
        dispatch(toEditShowtime({ showtimeId: booking.showtimeId, updatedData: data.updatedShowtime }));
      }
      if (data.updatedConcession?.length) {
        dispatch(toUpdateStock({ updatedConcession: data.updatedConcession }));
      }
      toast.success("Booking cancelled and refund processed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed. Please contact support.");
    } finally { setRefunding(null); }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Profile header */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-3xl font-black text-white flex-shrink-0 shadow-lg shadow-red-900/40">
            {user?.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                🎬 {myBookings.length} Booking{myBookings.length !== 1 ? "s" : ""}
              </span>
              <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                ♥ {favMovies.length} Favorite{favMovies.length !== 1 ? "s" : ""}
              </span>
              {user?.isAdmin && (
                <span className="px-3 py-1 bg-yellow-900/40 text-yellow-400 text-xs rounded-full border border-yellow-700/40">
                  ⭐ Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {user?.isAdmin && (
              <button onClick={() => navigate("/admin")}
                className="px-4 py-2.5 bg-yellow-900/40 hover:bg-yellow-900/70 text-yellow-400 border border-yellow-700/40 font-semibold text-sm rounded-xl transition-colors">
                ⚙️ Admin Panel
              </button>
            )}
            <button onClick={() => { dispatch(authLogout()); toast.success("Logged out!"); navigate("/"); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-700/50 font-semibold text-sm rounded-xl transition-all">
              Logout
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-900 rounded-xl p-1 border border-gray-800 w-fit">
          {[["bookings","🎟️ My Bookings"],["favorites","♥ Favorites"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab===t ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Bookings Tab ─── */}
          {tab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {!myBookings.length ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-6xl mb-4">🎬</p>
                  <p className="text-xl font-semibold text-gray-400">No bookings yet</p>
                  <p className="text-sm mt-2">Browse movies and book your first ticket!</p>
                  <button onClick={() => navigate("/movies")}
                    className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                    Browse Movies
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking, i) => {
                    const showtime = showtimes.find(s => String(s._id) === String(booking.showtimeId));
                    const movie    = movies.find(m => String(m._id) === String(showtime?.movieId));
                    const isPast   = showtime?.date && new Date(showtime.date) < new Date();

                    return (
                      <motion.div key={booking._id}
                        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                        className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                        <div className="flex flex-col sm:flex-row">
                          {/* Movie poster */}
                          {movie?.poster && (
                            <div className="sm:w-28 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/movie/details/${movie._id}`)}>
                              <img src={movie.poster} alt={movie.title} className="w-full h-36 sm:h-full object-cover" />
                            </div>
                          )}

                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <h3 className="text-white font-bold text-lg cursor-pointer hover:text-red-400 transition-colors"
                                  onClick={() => navigate(`/movie/details/${movie?._id}`)}>
                                  {movie?.title || "Movie"}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                  {showtime?.date
                                    ? new Date(showtime.date).toLocaleDateString("en-PH", { weekday:"short", month:"short", day:"numeric", year:"numeric" })
                                    : "—"}
                                  {" · "}{showtime?.startTime}
                                  {showtime?.hall && ` · ${showtime.hall}`}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  💺 {booking.ticket?.join(", ")}
                                </p>
                                <p className="text-gray-600 text-xs mt-0.5 font-mono">
                                  Ref: CNM-{booking._id?.slice(-8).toUpperCase()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${STATUS_STYLE[booking.status] || STATUS_STYLE.Pending}`}>
                                {booking.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800 flex-wrap gap-2">
                              <span className="text-red-400 font-black text-xl">₱{booking.totalAmount?.toFixed(2)}</span>
                              <div className="flex gap-2 flex-wrap">
                                <button onClick={() => navigate(`/ticket/${booking._id}`)}
                                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                  🎫 View Ticket
                                </button>

                                {/* Rate button - only for past paid bookings not yet reviewed */}
                                {booking.status === "Paid" && isPast && !booking.isReviewed && (
                                  <button onClick={() => setRateModal(booking)}
                                    className="px-4 py-2 bg-yellow-900/40 hover:bg-yellow-900/70 text-yellow-400 text-xs font-semibold rounded-lg border border-yellow-800/50 transition-colors">
                                    ⭐ Rate
                                  </button>
                                )}

                                {/* Refund button - only for upcoming paid bookings */}
                                {booking.status === "Paid" && !isPast && (
                                  <button onClick={() => handleRefund(booking)}
                                    disabled={refunding === booking._id}
                                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-xs font-semibold rounded-lg border border-red-800/50 transition-colors disabled:opacity-50">
                                    {refunding === booking._id ? (
                                      <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                      </span>
                                    ) : "↩ Cancel"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Favorites Tab ─── */}
          {tab === "favorites" && (
            <motion.div key="favorites" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {!favMovies.length ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-6xl mb-4">♡</p>
                  <p className="text-xl font-semibold text-gray-400">No favorites yet</p>
                  <p className="text-sm mt-2">Tap the heart icon on any movie to save it here.</p>
                  <button onClick={() => navigate("/movies")}
                    className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                    Browse Movies
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favMovies.map(movie => (
                    <motion.div key={movie._id} whileHover={{ y:-4, scale:1.02 }}
                      onClick={() => navigate(`/movie/details/${movie._id}`)}
                      className="cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-800/60 transition-all">
                      <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                      <div className="p-3">
                        <p className="text-white font-bold text-sm line-clamp-1">{movie.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{movie.genre?.slice(0,2).join(" · ")}</p>
                        <p className="text-yellow-400 text-xs mt-0.5">⭐ {movie.rating}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rate modal */}
      <AnimatePresence>
        {rateModal && (
          <RateModal
            booking={rateModal}
            showtime={showtimes.find(s => String(s._id) === String(rateModal.showtimeId))}
            movie={movies.find(m => m._id === showtimes.find(s => String(s._id) === String(rateModal.showtimeId))?.movieId)}
            onClose={() => setRateModal(null)}
            onRated={() => setRateModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfilePage;
