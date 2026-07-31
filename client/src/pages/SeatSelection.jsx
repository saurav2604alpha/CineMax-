import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { setId, setSeats } from "../store/slices/bookingSlice";
import { connectSocket } from "../api/socket";

// Generate A1-A12, B1-B12 ... seat map from total count
const buildRows = (total, perRow = 12) => {
  const rows = [];
  let remaining = total;
  for (let i = 0; remaining > 0; i++) {
    const count = Math.min(perRow, remaining);
    const letter = String.fromCharCode(65 + i);
    rows.push({
      letter,
      seats: Array.from({ length: count }, (_, j) => `${letter}${j + 1}`),
    });
    remaining -= count;
  }
  return rows;
};

const SeatSelection = () => {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();

  const [selected, setSelected] = useState([]);
  const [locked, setLocked]     = useState({});
  const socketRef               = useRef(null);
  const selectedRef             = useRef(selected); // always-current ref for cleanup

  // Keep ref in sync with state
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const showtimes = useSelector(s => s.showtime.showtimes);
  const movies    = useSelector(s => s.movie.movies);
  const userId    = useSelector(s => s.storage.userId);

  const showtime = showtimes.find(s => String(s._id) === String(id));
  const movie    = movies.find(m => String(m._id) === String(showtime?.movieId));
  const rows     = showtime ? buildRows(showtime.availableSeats) : [];

  // BUG FIX: Socket cleanup uses ref (not stale closure over selected)
  useEffect(() => {
    if (!id) return;

    const s = connectSocket();
    socketRef.current = s;

    s.emit("join-showtime", { showtimeId: id });

    s.on("seats-updated", ({ lockedSeats }) => {
      setLocked(lockedSeats || {});
    });

    s.on("seat-lock-denied", ({ seat }) => {
      toast.error(`Seat ${seat} was just taken by someone else!`);
      setSelected(prev => prev.filter(x => x !== seat));
    });

    return () => {
      // Use ref to get current seats at cleanup time
      selectedRef.current.forEach(seat => {
        s.emit("unlock-seat", { showtimeId: id, seat });
      });
      s.emit("leave-showtime", { showtimeId: id });
      s.off("seats-updated");
      s.off("seat-lock-denied");
    };
  }, [id]);

  const handleSeat = useCallback((seat) => {
    if (!showtime) return;
    if (showtime?.bookedSeats?.map(String).includes(String(seat))) return;
    if (locked[seat] && locked[seat].userId !== userId) return;

    const isSelected = selected.includes(seat);

    if (isSelected) {
      setSelected(prev => prev.filter(x => x !== seat));
      socketRef.current?.emit("unlock-seat", { showtimeId: id, seat });
    } else {
      if (selected.length >= 10) {
        toast.warning("You can book a maximum of 10 seats at once.");
        return;
      }
      socketRef.current?.emit("lock-seat", { showtimeId: id, seat, userId });
      setSelected(prev => [...prev, seat]);
    }
  }, [selected, locked, showtime, id, userId]);

  const proceed = () => {
    if (!selected.length) {
      toast.error("Please select at least one seat.");
      return;
    }
    if (!userId) {
      toast.error("Please log in to book seats.");
      navigate("/login", { state: { from: `/booking/seat/${id}` } });
      return;
    }
    dispatch(setSeats([...selected].sort()));
    dispatch(setId(id));
    navigate("/booking/add-on");
  };

  const getStatus = (seat) => {
    if (showtime?.bookedSeats?.map(String).includes(String(seat))) return "booked";
    if (selected.includes(seat)) return "selected";
    if (locked[seat] && locked[seat].userId !== userId) return "locked";
    return "available";
  };

  const seatStyles = {
    available: "bg-gray-700 hover:bg-green-600 border-gray-600 cursor-pointer hover:scale-110",
    selected:  "bg-red-600 border-red-400 cursor-pointer scale-110 shadow-lg shadow-red-900/50",
    booked:    "bg-gray-800 border-gray-700 cursor-not-allowed opacity-40",
    locked:    "bg-yellow-700 border-yellow-600 cursor-not-allowed opacity-70",
  };

  if (!showtime) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-gray-400 text-lg">Showtime not found.</p>
          <button onClick={() => navigate("/movies")} className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold">Browse Movies</button>
        </div>
      </div>
    );
  }

  const bookedCount    = showtime.bookedSeats?.length || 0;
  const availableCount = (showtime.availableSeats || 0) - bookedCount;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-36">
      {/* Movie header banner */}
      <div className="relative h-48 overflow-hidden mb-2">
        {movie?.background ? (
          <img src={movie.background} alt={movie?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 bg-black/60 hover:bg-black/90 text-white text-sm rounded-full backdrop-blur-sm transition-colors"
        >
          ← Back
        </button>

        <div className="absolute bottom-4 left-4 lg:left-8">
          <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">{movie?.title}</h1>
          <p className="text-gray-300 text-sm mt-1">
            {showtime.hall} · {showtime.startTime} ·{" "}
            {new Date(showtime.date).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-red-400 font-bold text-sm">₱{showtime.price} per seat</span>
            <span className={`text-xs font-medium ${availableCount <= 20 ? "text-yellow-400" : "text-green-400"}`}>
              {availableCount} seats available
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Screen indicator */}
        <div className="mb-10 text-center">
          <div className="relative max-w-2xl mx-auto">
            <div className="h-3 bg-gradient-to-b from-gray-300/60 to-transparent rounded-t-[50%] mx-8" />
            <div className="h-1 bg-gradient-to-b from-white/20 to-transparent rounded-t-[50%] mx-4 -mt-1" />
          </div>
          <p className="text-gray-500 text-xs mt-2 tracking-[0.3em] uppercase">🎥 SCREEN</p>
        </div>

        {/* Seat map */}
        <div className="space-y-2.5 mb-10 overflow-x-auto pb-2">
          {rows.map(({ letter, seats }) => (
            <div key={letter} className="flex items-center gap-2 justify-center min-w-max mx-auto">
              <span className="w-6 text-gray-500 text-xs font-mono text-right flex-shrink-0">{letter}</span>
              <div className="flex gap-1.5">
                {seats.map((seat, idx) => {
                  const status = getStatus(seat);
                  return (
                    <span key={seat} className="flex items-center">
                      {/* Aisle gap in middle */}
                      {idx === Math.floor(seats.length / 2) && <span className="w-5 flex-shrink-0" />}
                      <motion.button
                        whileTap={status === "available" ? { scale: 0.8 } : {}}
                        onClick={() => handleSeat(seat)}
                        disabled={status === "booked" || status === "locked"}
                        title={`${seat} - ${status}`}
                        className={`w-8 h-7 rounded-t-lg border-t border-l border-r text-xs font-bold transition-all duration-100 ${seatStyles[status]}`}
                      />
                    </span>
                  );
                })}
              </div>
              <span className="w-6 text-gray-500 text-xs font-mono flex-shrink-0">{letter}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          {[
            ["bg-gray-700", "Available"],
            ["bg-red-600", "Selected"],
            ["bg-gray-800 opacity-40", "Booked"],
            ["bg-yellow-700 opacity-70", "Reserved (others)"],
          ].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-5 rounded-t-lg border border-gray-600 ${cls}`} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Seat availability bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                bookedCount / showtime.availableSeats > 0.8 ? "bg-red-500" :
                bookedCount / showtime.availableSeats > 0.5 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${(bookedCount / showtime.availableSeats) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{bookedCount} booked</span>
            <span>{availableCount} available</span>
          </div>
        </div>
      </div>

      {/* Floating bottom action bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/98 backdrop-blur-md border-t border-gray-700 shadow-2xl"
          >
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{selected.length}</span> seat{selected.length > 1 ? "s" : ""} selected:{" "}
                  <span className="text-white font-medium">{[...selected].sort().join(", ")}</span>
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  ₱{showtime.price} × {selected.length} ={" "}
                  <span className="text-red-400 font-bold text-xl">₱{(showtime.price * selected.length).toFixed(2)}</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={proceed}
                className="w-full sm:w-auto px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/50 text-lg"
              >
                Continue to Snacks →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatSelection;
