import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { moviesAPI, bookingsAPI, usersAPI, contactAPI } from "../api";
import { fetchAllMovies, toAddMovie, toDeleteMovie } from "../store/slices/movieSlice";
import { toFetchBookings } from "../store/slices/bookingSlice";
import { toFetchUsers } from "../store/slices/userSlice";
import { TableSkeleton } from "../components/ui/Skeleton";

/* ─── Guard ──────────────────────────────────────────────────────────────── */
const useAdminGuard = () => {
  const navigate = useNavigate();
  const userId  = useSelector(s => s.storage.userId);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  useEffect(() => { if (!userId || !isAdmin) { toast.error("Admin access required."); navigate("/"); } }, [userId, isAdmin]);
  return isAdmin;
};

/* ─── Movie Form Modal ───────────────────────────────────────────────────── */
const MovieModal = ({ movie, onClose, onSaved }) => {
  const [form, setForm] = useState(
    movie
      ? { ...movie, genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre }
      : { title:"", overview:"", poster:"", background:"", trailer:"", genre:"", rating:"", duration:"", releaseDate:"", director:"" }
  );
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, genre: form.genre.split(",").map(g=>g.trim()).filter(Boolean) };
      if (movie) { await moviesAPI.update(movie._id, payload); toast.success("Movie updated!"); }
      else       { await moviesAPI.create(payload);            toast.success("Movie added!"); }
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save."); }
    finally { setLoading(false); }
  };

  const fields = [
    ["title","Title","text",true], ["overview","Overview","text",true],
    ["poster","Poster URL","url",true], ["background","Banner URL","url",true],
    ["trailer","Trailer URL","url",false], ["genre","Genres (comma-separated)","text",true],
    ["rating","Rating (0–10)","number",true], ["duration","Duration (minutes)","number",true],
    ["releaseDate","Release Date","date",true], ["director","Director","text",false],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white font-bold text-xl">{movie ? "Edit Movie" : "Add Movie"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {fields.map(([name, label, type, req]) => (
            <div key={name}>
              <label className="block text-gray-400 text-xs mb-1">{label}{req && <span className="text-red-500"> *</span>}</label>
              {name === "overview"
                ? <textarea name={name} value={form[name]||""} onChange={handle} rows={3} required={req}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none" />
                : <input type={type} name={name} value={form[name]||""} onChange={handle} required={req}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500" />
              }
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm disabled:opacity-60">
              {loading ? "Saving..." : movie ? "Update" : "Add Movie"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─── Movies Tab ─────────────────────────────────────────────────────────── */
const MoviesTab = () => {
  const dispatch = useDispatch();
  const movies   = useSelector(s => s.movie.movies);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    setLoading(true);
    try { const { data } = await moviesAPI.getAll(); dispatch(fetchAllMovies(data)); }
    catch { toast.error("Failed to reload movies."); }
    finally { setLoading(false); }
  };

  const del = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await moviesAPI.delete(id); dispatch(toDeleteMovie(id)); toast.success("Movie deleted."); }
    catch { toast.error("Delete failed."); }
  };

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..."
          className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
        <button onClick={() => setModal("add")} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">+ Add Movie</button>
      </div>

      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>{["Poster","Title","Genre","Rating","Duration","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-gray-400 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(movie => (
                <tr key={movie._id} className="bg-gray-950 hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3"><img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg" /></td>
                  <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{movie.title}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{Array.isArray(movie.genre)?movie.genre.slice(0,2).join(", "):movie.genre}</td>
                  <td className="px-4 py-3"><span className="text-yellow-400">⭐</span> {movie.rating}</td>
                  <td className="px-4 py-3 text-gray-400">{movie.duration}m</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(movie)} className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-900/70 text-blue-400 rounded-lg text-xs border border-blue-800/50">Edit</button>
                      <button onClick={() => del(movie._id, movie.title)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-lg text-xs border border-red-800/50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="text-center py-10 text-gray-500">No movies found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modal && <MovieModal movie={modal === "add" ? null : modal} onClose={() => setModal(null)} onSaved={reload} />}
      </AnimatePresence>
    </div>
  );
};

/* ─── Bookings Tab ───────────────────────────────────────────────────────── */
const BookingsTab = () => {
  const bookings  = useSelector(s => s.booking.bookings);
  const movies    = useSelector(s => s.movie.movies);
  const showtimes = useSelector(s => s.showtime.showtimes);
  const users     = useSelector(s => s.user.users);
  const [search, setSearch] = useState("");

  const revenue = bookings.filter(b=>b.status==="Paid").reduce((s,b)=>s+(b.totalAmount||0),0);

  const filtered = bookings.filter(b => {
    const st = showtimes.find(s => String(s._id) === String(b.showtimeId));
    const mv = movies.find(m => String(m._id) === String(st?.movieId));
    return mv?.title.toLowerCase().includes(search.toLowerCase()) || b._id.includes(search);
  });

  const statusColor = { Paid:"text-green-400", Refunded:"text-gray-400", Pending:"text-yellow-400" };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[["🎟️ Total",bookings.length],["✅ Paid",bookings.filter(b=>b.status==="Paid").length],["↩️ Refunded",bookings.filter(b=>b.status==="Refunded").length],["💰 Revenue",`₱${revenue.toFixed(2)}`]].map(([l,v])=>(
          <div key={l} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <p className="text-gray-400 text-xs">{l}</p>
            <p className="text-white font-bold text-xl mt-1">{v}</p>
          </div>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by movie or booking ID..."
        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm mb-4" />
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900">
            <tr>{["Movie","User","Seats","Total","Status","Date"].map(h=><th key={h} className="px-4 py-3 text-left text-gray-400 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(b => {
              const st = showtimes.find(s=>s._id===b.showtimeId);
              const mv = movies.find(m=>m._id===st?.movieId);
              const u  = users.find(u=>u._id===b.userId);
              return (
                <tr key={b._id} className="bg-gray-950 hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 text-white font-medium max-w-[140px] truncate">{mv?.title||"—"}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{u?`${u.firstName} ${u.lastName}`:b.userId?.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[100px] truncate">{b.ticket?.join(", ")}</td>
                  <td className="px-4 py-3 text-red-400 font-semibold">₱{b.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`font-medium ${statusColor[b.status]||"text-gray-400"}`}>{b.status}</span></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={6} className="text-center py-10 text-gray-500">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Users Tab ──────────────────────────────────────────────────────────── */
const UsersTab = () => {
  const users    = useSelector(s => s.user.users);
  const bookings = useSelector(s => s.booking.bookings);
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..."
        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm mb-4" />
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900">
            <tr>{["User","Email","Role","Bookings","Joined"].map(h=><th key={h} className="px-4 py-3 text-left text-gray-400 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(u => (
              <tr key={u._id} className="bg-gray-950 hover:bg-gray-900 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.firstName?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isAdmin ? "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                    {u.isAdmin ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{bookings.filter(b=>b.userId===u._id).length}</td>
                <td className="px-4 py-3 text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Contact Tab ────────────────────────────────────────────────────────── */
const ContactTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await contactAPI.getAll(); setMessages(data); }
    catch { toast.error("Failed to load messages."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await contactAPI.markRead(id); setMessages(prev => prev.map(m => String(m._id) === String(id) ? { ...m, isRead: true } : m)); }
    catch { toast.error("Failed to update."); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try { await contactAPI.delete(id); setMessages(prev => prev.filter(m => m._id !== id)); toast.success("Deleted."); }
    catch { toast.error("Failed to delete."); }
  };

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-white font-semibold">Contact Messages</h3>
        {unread > 0 && <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">{unread} unread</span>}
        <button onClick={load} className="ml-auto text-gray-400 hover:text-white text-sm transition-colors">↻ Refresh</button>
      </div>

      {loading ? <TableSkeleton rows={4} /> : !messages.length ? (
        <div className="text-center py-16 text-gray-500"><p className="text-4xl mb-3">📩</p><p>No messages yet.</p></div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg._id} className={`rounded-xl border p-5 transition-colors ${msg.isRead ? "bg-gray-900 border-gray-800" : "bg-gray-900 border-red-800/40 shadow-sm shadow-red-900/10"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-bold">{msg.name}</span>
                    <span className="text-gray-400 text-sm">{msg.email}</span>
                    {!msg.isRead && <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-xs rounded-full border border-red-600/30">New</span>}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">Subject: <span className="text-gray-300">{msg.subject}</span></p>
                  <p className="text-gray-300 mt-3 text-sm leading-relaxed">{msg.message}</p>
                  <p className="text-gray-600 text-xs mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!msg.isRead && (
                    <button onClick={() => markRead(msg._id)} className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-900/70 text-blue-400 rounded-lg text-xs border border-blue-800/50">Mark Read</button>
                  )}
                  <button onClick={() => del(msg._id)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-lg text-xs border border-red-800/50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main AdminPage ─────────────────────────────────────────────────────── */
const AdminPage = () => {
  const isAdmin  = useAdminGuard();
  const [tab, setTab] = useState("movies");
  const movies   = useSelector(s => s.movie.movies);
  const bookings = useSelector(s => s.booking.bookings);
  const users    = useSelector(s => s.user.users);
  if (!isAdmin) return null;

  const tabs = [
    { key:"movies",   label:"🎬 Movies",   count: movies.length },
    { key:"bookings", label:"🎟️ Bookings",  count: bookings.length },
    { key:"users",    label:"👥 Users",     count: users.length },
    { key:"contact",  label:"📩 Messages",  count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">Admin <span className="text-red-500">Panel</span></h1>
          <p className="text-gray-400 mt-1">Manage your cinema platform</p>
        </motion.div>

        <div className="flex gap-2 mb-6 bg-gray-900 rounded-xl p-1 border border-gray-800 w-fit flex-wrap">
          {tabs.map(({ key, label, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab===key?"bg-red-600 text-white shadow-lg":"text-gray-400 hover:text-white"}`}>
              {label}
              {count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab===key?"bg-red-700 text-red-100":"bg-gray-800 text-gray-400"}`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tab === "movies"   && <MoviesTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "users"    && <UsersTab />}
            {tab === "contact"  && <ContactTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPage;
