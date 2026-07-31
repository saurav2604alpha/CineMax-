import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addItemToCart, removeItemToCart, resetCart } from "../store/slices/bookingSlice";

const AddOnPage = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const didMount   = useRef(false);

  const addOns     = useSelector(s => s.booking.addOns);
  const booked     = useSelector(s => s.booking);
  const showtimes  = useSelector(s => s.showtime.showtimes);
  const movies     = useSelector(s => s.movie.movies);
  const concessions= useSelector(s => s.concession.concessions);

  // BUG FIX 1: reset cart only once on first mount, not every render
  useEffect(() => {
    if (!didMount.current) {
      dispatch(resetCart());
      didMount.current = true;
    }
  }, []);

  // BUG FIX 2: redirect in useEffect, not during render (avoids React invariant)
  useEffect(() => {
    if (!booked.selectedShowtimeId || !booked.selectedSeats?.length) {
      toast.error("No seats selected. Please start over.");
      navigate("/movies", { replace: true });
    }
  }, [booked.selectedShowtimeId, booked.selectedSeats, navigate]);

  const showtime    = showtimes.find(s => String(s._id) === String(booked.selectedShowtimeId));
  const movie       = movies.find(m => String(m._id) === String(showtime?.movieId));
  const ticketTotal = (showtime?.price || 0) * (booked.selectedSeats?.length || 0);
  const grand       = ticketTotal + (addOns.subTotal || 0);

  // Show loading state while redirect is in progress
  if (!booked.selectedShowtimeId || !booked.selectedSeats?.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Add <span className="text-red-500">Snacks</span></h1>
          <p className="text-gray-400 mt-2">Pre-order your cinema treats — skip the queue! 🍿</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Concessions list */}
          <div className="md:col-span-3 space-y-3">
            {!concessions.length ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">🍿</p>
                <p>No concessions available right now.</p>
                <button
                  onClick={() => navigate("/booking/checkout")}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Skip & Continue →
                </button>
              </div>
            ) : (
              concessions.map((item, i) => {
                const cartItem = addOns.items.find(x => x.id === item._id);
                const qty = cartItem?.quantity || 0;
                const oos = item.stock === 0;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-gray-900 rounded-xl border ${oos ? "border-gray-800 opacity-50" : qty > 0 ? "border-red-700/50" : "border-gray-800 hover:border-gray-700"} p-4 flex items-center gap-4 transition-all`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-lg"
                        onError={e => { e.target.src = "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=200"; }}
                      />
                      {oos && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                          <span className="text-red-400 text-xs font-bold">OUT</span>
                        </div>
                      )}
                      {qty > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {qty}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{item.name}</h3>
                      <p className="text-red-400 font-semibold mt-1">₱{item.price.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {oos ? "Out of stock" : `${item.stock} available`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => dispatch(removeItemToCart(item._id))}
                        disabled={qty === 0}
                        className={`w-9 h-9 rounded-full font-bold text-xl flex items-center justify-center transition-all ${
                          qty === 0
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                            : "bg-gray-700 hover:bg-red-800 text-white active:scale-95"
                        }`}
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-white font-bold text-lg">{qty}</span>
                      <button
                        onClick={() => dispatch(addItemToCart({ id: item._id, price: item.price, name: item.name }))}
                        disabled={oos || qty >= item.stock}
                        className={`w-9 h-9 rounded-full font-bold text-xl flex items-center justify-center transition-all ${
                          oos || qty >= item.stock
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-500 text-white active:scale-95"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Order Summary - sticky sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>

              {/* Movie + ticket info */}
              <div className="flex justify-between items-start text-sm pb-3 border-b border-gray-800">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-medium truncate">{movie?.title || "Movie"}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {booked.selectedSeats?.length} ticket{booked.selectedSeats?.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {showtime?.hall} · {showtime?.startTime}
                  </p>
                </div>
                <span className="text-white font-semibold flex-shrink-0">₱{ticketTotal.toFixed(2)}</span>
              </div>

              {/* Add-on items */}
              <div className="space-y-2 py-3 min-h-[50px] border-b border-gray-800">
                {!addOns.items.length ? (
                  <p className="text-gray-600 text-xs text-center py-2">No snacks added yet</p>
                ) : (
                  addOns.items.map(x => (
                    <div key={x.id} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate max-w-[130px]">{x.name} ({x.quantity}×)</span>
                      <span className="text-white flex-shrink-0">₱{(x.price * x.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 mb-5">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-red-400 font-black text-2xl">₱{grand.toFixed(2)}</span>
              </div>

              {/* Seats reminder */}
              <div className="mb-4 p-3 bg-gray-800/60 rounded-xl text-xs text-gray-400 space-y-1">
                <p>💺 <span className="text-white font-medium">{booked.selectedSeats?.join(", ")}</span></p>
                <p>
                  📅{" "}
                  {showtime?.date
                    ? new Date(showtime.date).toLocaleDateString("en-PH", { weekday:"short", month:"short", day:"numeric" })
                    : ""}
                  {" · "}{showtime?.startTime}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/booking/checkout")}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl mb-2 shadow-lg shadow-red-900/30 transition-colors text-lg"
              >
                Proceed to Payment →
              </motion.button>

              <button
                onClick={() => navigate(-1)}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition-colors"
              >
                ← Change Seats
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddOnPage;
