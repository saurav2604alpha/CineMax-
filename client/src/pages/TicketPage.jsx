import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { toFetchBookings } from "../store/slices/bookingSlice";
import { bookingsAPI } from "../api";

const TicketPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const userId    = useSelector(s => s.storage.userId);
  const bookings  = useSelector(s => s.booking.bookings);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies    = useSelector(s => s.movie.movies);
  const theaters  = useSelector(s => s.theater.theaters);

  // Fetch bookings if not in Redux (e.g. page refresh)
  useEffect(() => {
    if (!bookings.find(b => String(b._id) === String(id)) && userId) {
      setLoading(true);
      bookingsAPI.getByUser(userId)
        .then(({ data }) => dispatch(toFetchBookings(data)))
        .catch(() => {})
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
      doc.setFillColor(10,10,10); doc.rect(0,0,148,210,"F");
      doc.setFillColor(229,9,20); doc.rect(0,0,148,28,"F");
      doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont("helvetica","bold");
      doc.text("CINEMAX", 74, 12, { align:"center" });
      doc.setFontSize(9); doc.setFont("helvetica","normal");
      doc.text("OFFICIAL MOVIE TICKET", 74, 21, { align:"center" });
      doc.setFontSize(14); doc.setFont("helvetica","bold");
      doc.text(movie?.title || "—", 74, 44, { align:"center", maxWidth:128 });
      const rows = [
        ["Date",    new Date(showtime?.date).toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric",year:"numeric"})],
        ["Time",    showtime?.startTime||"—"],
        ["Hall",    showtime?.hall||"—"],
        ["Theater", theater?.name||"—"],
        ["Seats",   booking?.ticket?.join(", ")||"—"],
        ["Status",  booking?.status||"—"],
        ["Ref",     `CNM-${booking?._id}`],
      ];
      let y = 60; doc.setFontSize(9);
      rows.forEach(([l,v]) => {
        doc.setTextColor(140,140,140); doc.setFont("helvetica","normal"); doc.text(l, 18, y);
        doc.setTextColor(220,220,220); doc.setFont("helvetica","bold"); doc.text(String(v||"—"), 130, y, { align:"right", maxWidth:90 });
        y += 11;
      });
      doc.setDrawColor(40,40,40); doc.line(18,y+2,130,y+2); y+=12;
      doc.setTextColor(229,9,20); doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text(`Total: \u20B1${booking?.totalAmount?.toFixed(2)}`, 74, y, { align:"center" });
      y+=16; doc.setFillColor(20,20,20); doc.roundedRect(18,y,112,18,2,2,"F");
      doc.setTextColor(229,9,20); doc.setFontSize(8);
      doc.text(`CNM-${booking?._id}`, 74, y+11, { align:"center" });
      doc.setTextColor(80,80,80); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
      doc.text("Arrive 15 minutes early. Enjoy your movie!", 74, 202, { align:"center" });
      doc.save(`CineMax-Ticket-${(movie?.title||"ticket").replace(/\s+/g,"-")}.pdf`);
      toast.success("Ticket PDF downloaded!");
    } catch(err) { console.error(err); toast.error("PDF generation failed."); }
  };

  const STATUS_STYLE = {
    Paid:     "bg-green-900/40 text-green-400 border-green-700/40",
    Refunded: "bg-gray-800 text-gray-400 border-gray-700",
    Pending:  "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
  };

  if (loading || (!booking && !loading)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="text-center">
          {loading
            ? <><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading ticket...</p></>
            : <><p className="text-5xl mb-4">🎫</p><p className="text-gray-400 text-lg mb-4">Ticket not found.</p>
                <button onClick={() => navigate("/profile")} className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">My Bookings</button></>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-sm mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-6">
          <h1 className="text-2xl font-black text-white">Your <span className="text-red-500">Ticket</span></h1>
        </motion.div>

        {/* Ticket card */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl shadow-black/50">

          {/* Banner */}
          <div className="relative h-36 overflow-hidden">
            {movie?.background
              ? <img src={movie.background} alt={movie.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-red-900 to-gray-900" />
            }
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[booking.status]||STATUS_STYLE.Pending}`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Movie info */}
            <div className="flex items-start gap-4 -mt-10 mb-5">
              <img src={movie.poster} alt={movie.title}
                className="w-16 h-24 object-cover rounded-xl shadow-xl border-2 border-gray-800 flex-shrink-0" />
              <div className="pt-10">
                <h2 className="text-white font-black text-lg leading-tight">{movie.title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{movie.genre?.slice(0,2).join(" · ")}</p>
              </div>
            </div>

            {/* Perforation */}
            <div className="relative flex items-center my-5">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-gray-950" />
              <div className="flex-1 border-t-2 border-dashed border-gray-700" />
              <div className="absolute -right-6 w-6 h-6 rounded-full bg-gray-950" />
            </div>

            {/* Booking details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["📅 Date",    new Date(showtime.date).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})],
                ["🕐 Time",    showtime.startTime],
                ["🎭 Hall",    showtime.hall],
                ["🏛️ Theater", theater?.name||"—"],
                ["💺 Seats",   booking.ticket?.join(", ")],
                ["💰 Total",   `₱${booking.totalAmount?.toFixed(2)}`],
              ].map(([l,v]) => (
                <div key={l}>
                  <p className="text-gray-500 text-xs">{l}</p>
                  <p className="text-white font-semibold mt-0.5 text-sm break-words">{v}</p>
                </div>
              ))}
            </div>

            {/* Perforation */}
            <div className="relative flex items-center my-5">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-gray-950" />
              <div className="flex-1 border-t-2 border-dashed border-gray-700" />
              <div className="absolute -right-6 w-6 h-6 rounded-full bg-gray-950" />
            </div>

            {/* Barcode */}
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">Booking Reference</p>
              <p className="text-red-400 font-mono font-bold tracking-wider">{`CNM-${booking._id?.slice(-12).toUpperCase()}`}</p>
              <div className="flex justify-center gap-px mt-3 h-12 items-end">
                {(booking._id || "").split("").map((ch, i) => (
                  <div key={i} className="bg-white/80 rounded-sm"
                    style={{ width: `${(ch.charCodeAt(0) % 3) + 1}px`, height: `${30 + (ch.charCodeAt(0) % 20)}px` }} />
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-2">Show this at the entrance</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} className="mt-6 space-y-3">
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handlePDF}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/30">
            📄 Download PDF Ticket
          </motion.button>
          <button onClick={() => navigate("/profile")}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors">
            ← My Bookings
          </button>
          <button onClick={() => navigate("/")}
            className="w-full py-2.5 text-gray-500 hover:text-gray-300 transition-colors text-sm">
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketPage;
