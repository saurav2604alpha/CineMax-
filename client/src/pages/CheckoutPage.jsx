import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DummyPaymentForm from "../components/booking/DummyPaymentForm";
import { bookingsAPI } from "../api";
import { toAddBooking, resetBooking } from "../store/slices/bookingSlice";
import { toEditShowtime } from "../store/slices/showtimeSlice";
import { toUpdateStock } from "../store/slices/concessionSlice";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  const booked    = useSelector(s => s.booking);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies    = useSelector(s => s.movie.movies);
  const userId    = useSelector(s => s.storage.userId);

  const showtime   = showtimes.find(s => String(s._id) === String(booked.selectedShowtimeId));
  const movie      = movies.find(m => String(m._id) === String(showtime?.movieId));
  const ticketSubtotal = (showtime?.price || 0) * (booked.selectedSeats?.length || 0);
  const snacksSubtotal = booked.addOns?.subTotal || 0;
  const total = ticketSubtotal + snacksSubtotal;

  // BUG FIX: guard with useEffect (not render-phase), give Redux time to hydrate
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!booked.selectedShowtimeId || !booked.selectedSeats?.length) {
        toast.error("No booking data found. Please select your seats first.");
        navigate("/movies", { replace: true });
      }
    }, 300); // small delay lets Redux state settle from navigation
    return () => clearTimeout(timer);
  }, []); // only run once on mount

  const handlePaymentSuccess = async (transactionId) => {
    if (!userId) {
      toast.error("You must be logged in to complete a booking.");
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        showtimeId:  booked.selectedShowtimeId,
        ticket:      booked.selectedSeats,
        ticketPrice: showtime?.price,
        addOns: (booked.addOns?.items || []).map(a => ({
          id:         a.id,
          name:       a.name,
          price:      a.price,
          quantity:   a.quantity,
          totalPrice: a.price * a.quantity,
        })),
        totalAmount: total,
        transactionId,
      };

      const { data } = await bookingsAPI.create(userId, payload);

      // Update Redux store
      dispatch(toAddBooking(data.newBooking));
      dispatch(toEditShowtime({ showtimeId: booked.selectedShowtimeId, updatedData: data.updatedShowtime }));
      if (data.updatedConcession?.length) {
        dispatch(toUpdateStock({ updatedConcession: data.updatedConcession }));
      }
      dispatch(resetBooking());

      toast.success("🎉 Booking confirmed! Enjoy your movie!");
      navigate(`/booking/success/${data.newBooking._id}`, { replace: true });
    } catch (err) {
      console.error("Booking save error:", err);
      const msg = err.response?.data?.message || "Failed to save booking. Please contact support.";
      toast.error(msg);
      setSaving(false);
    }
  };

  // Loading / redirect state
  if (!booked.selectedShowtimeId || !booked.selectedSeats?.length || !showtime) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Complete Your <span className="text-red-500">Booking</span></h1>
          <p className="text-gray-400 mt-1 text-sm">Secure dummy payment — no real money charged</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Movie mini-banner */}
              {movie?.background && (
                <div className="relative h-28 overflow-hidden">
                  <img src={movie.background} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    {movie.poster && (
                      <img src={movie.poster} alt={movie.title} className="h-14 w-10 object-cover rounded-lg shadow-lg flex-shrink-0" />
                    )}
                    <div>
                      <h2 className="text-white font-bold">{movie.title}</h2>
                      <p className="text-gray-300 text-xs">{showtime.hall} · {showtime.startTime}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-6">
                {saving ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Saving your booking...</h3>
                    <p className="text-gray-400 text-sm">Please do not close this page.</p>
                  </div>
                ) : (
                  <DummyPaymentForm
                    total={total}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => navigate(-1)}
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Order summary sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>

              {/* Booking details */}
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-800">
                {[
                  ["Date",  showtime.date ? new Date(showtime.date).toLocaleDateString("en-PH", { weekday:"short", month:"short", day:"numeric" }) : "—"],
                  ["Time",  showtime.startTime],
                  ["Hall",  showtime.hall],
                  ["Seats", booked.selectedSeats?.join(", ")],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-2">
                    <span className="text-gray-400 flex-shrink-0">{l}</span>
                    <span className="text-white text-right text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Tickets ({booked.selectedSeats?.length}× ₱{showtime.price})
                  </span>
                  <span className="text-white font-medium">₱{ticketSubtotal.toFixed(2)}</span>
                </div>

                {(booked.addOns?.items || []).map(x => (
                  <div key={x.id} className="flex justify-between">
                    <span className="text-gray-400">{x.name} ({x.quantity}×)</span>
                    <span className="text-white">₱{(x.price * x.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-3 mt-1 border-t border-gray-700 font-bold text-base">
                  <span className="text-white">Total</span>
                  <span className="text-red-400 text-xl">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500">
                <span>🔒 SSL</span>
                <span>🛡️ Secure</span>
                <span>💳 Dummy Gateway</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
