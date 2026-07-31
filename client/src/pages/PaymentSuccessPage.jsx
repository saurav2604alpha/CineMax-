import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { toFetchBookings } from "../store/slices/bookingSlice";
import { bookingsAPI } from "../api";

const PaymentSuccessPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const userId    = useSelector(s => s.storage.userId);
  const bookings  = useSelector(s => s.booking.bookings);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies    = useSelector(s => s.movie.movies);
  const theaters  = useSelector(s => s.theater.theaters);

  // BUG FIX: if booking not in Redux (e.g. after page refresh), fetch from API
  useEffect(() => {
    const found = bookings.find(b => String(b._id) === String(id));
    if (!found && userId) {
      setLoading(true);
      bookingsAPI.getByUser(userId)
        .then(({ data }) => {
          dispatch(toFetchBookings(data));
        })
        .catch(() => toast.error("Could not load booking details."))
        .finally(() => setLoading(false));
    }
  }, [id, userId]);

  const booking  = bookings.find(b => String(b._id) === String(id));
  const showtime = showtimes.find(s => String(s._id) === String(booking?.showtimeId));
  const movie    = movies.find(m => String(m._id) === String(showtime?.movieId));
  const theater  = theaters.find(t => String(t._id) === String(showtime?.theaterId));

  const handlePDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });

      // Background
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 148, 210, "F");

      // Header bar
      doc.setFillColor(229, 9, 20);
      doc.rect(0, 0, 148, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont("helvetica", "bold");
      doc.text("CINEMAX", 74, 12, { align: "center" });
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL MOVIE TICKET", 74, 21, { align: "center" });

      // Movie title
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text(movie?.title || "—", 74, 44, { align: "center", maxWidth: 128 });

      // Details table
      const rows = [
        ["Date",        new Date(showtime?.date).toLocaleDateString("en-PH", { weekday:"long", month:"long", day:"numeric", year:"numeric" })],
        ["Time",        showtime?.startTime || "—"],
        ["Hall",        showtime?.hall || "—"],
        ["Theater",     theater?.name || "—"],
        ["Seats",       booking?.ticket?.join(", ") || "—"],
        ["Transaction", booking?.paymentIntentId || "—"],
      ];
      let y = 60; doc.setFontSize(9);
      rows.forEach(([l, v]) => {
        doc.setTextColor(140, 140, 140); doc.setFont("helvetica", "normal");
        doc.text(l, 18, y);
        doc.setTextColor(220, 220, 220); doc.setFont("helvetica", "bold");
        doc.text(String(v || "—"), 130, y, { align: "right", maxWidth: 90 });
        y += 11;
      });

      // Total
      doc.setDrawColor(40, 40, 40); doc.line(18, y + 2, 130, y + 2); y += 12;
      doc.setTextColor(229, 9, 20); doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text(`Total: \u20B1${booking?.totalAmount?.toFixed(2)}`, 74, y, { align: "center" });

      // Booking ref
      y += 16;
      doc.setFillColor(20, 20, 20); doc.roundedRect(18, y, 112, 18, 2, 2, "F");
      doc.setTextColor(229, 9, 20); doc.setFontSize(8);
      doc.text(`Ref: CNM-${booking?._id}`, 74, y + 11, { align: "center" });

      // Footer
      doc.setTextColor(80, 80, 80); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      doc.text("Arrive 15 minutes early. Enjoy your movie!", 74, 202, { align: "center" });

      doc.save(`CineMax-${(movie?.title || "ticket").replace(/\s+/g, "-")}.pdf`);
      toast.success("Ticket downloaded!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("PDF generation failed. Try again.");
    }
  };

  if (loading || !booking || !movie) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading your booking...</p>
          {!loading && (
            <button onClick={() => navigate("/profile")} className="mt-4 text-red-400 hover:text-red-300 text-sm">
              Go to My Bookings →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Success checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewBox="0 0 24 24"
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path d="M5 13l4 4L19 7" />
            </motion.svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-gray-400 mt-2">Your seats are reserved. Enjoy the show! 🎉</p>
          {booking.paymentIntentId && (
            <p className="text-gray-500 text-xs mt-2">
              Transaction:{" "}
              <span className="text-red-400 font-mono font-semibold">{booking.paymentIntentId}</span>
            </p>
          )}
        </motion.div>

        {/* Ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6"
        >
          {/* Banner */}
          {movie.background && (
            <div className="relative h-32 overflow-hidden">
              <img src={movie.background} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
            </div>
          )}

          <div className="p-5">
            {/* Movie + theater */}
            <div className="flex items-start gap-4 mb-5" style={{ marginTop: movie.background ? "-2rem" : "0" }}>
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-xl shadow-lg flex-shrink-0 border-2 border-gray-800"
              />
              <div className="pt-6">
                <h2 className="text-xl font-black text-white leading-tight">{movie.title}</h2>
                {theater && <p className="text-gray-400 text-sm mt-0.5">🏛️ {theater.name}</p>}
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                  ✓ Confirmed
                </span>
              </div>
            </div>

            {/* Booking details */}
            <div className="space-y-2.5 text-sm border-t border-dashed border-gray-700 pt-4">
              {[
                ["📅 Date",  new Date(showtime.date).toLocaleDateString("en-PH", { weekday:"short", month:"short", day:"numeric", year:"numeric" })],
                ["🕐 Time",  showtime.startTime],
                ["🎭 Hall",  showtime.hall],
                ["💺 Seats", booking.ticket?.join(", ")],
                ["💰 Total", `₱${booking.totalAmount?.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-start gap-3">
                  <span className="text-gray-400 flex-shrink-0">{l}</span>
                  <span className="text-white font-medium text-right text-xs">{v}</span>
                </div>
              ))}
            </div>

            {/* Booking ref */}
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
              <p className="text-gray-500 text-xs mb-1">Booking Reference</p>
              <p className="text-red-400 font-mono font-bold">CNM-{booking._id?.slice(-12).toUpperCase()}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePDF}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
          >
            📄 Download PDF Ticket
          </motion.button>
          <button
            onClick={() => navigate(`/ticket/${booking._id}`)}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
          >
            🎫 View Digital Ticket
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            📋 My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
