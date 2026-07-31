import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { authLogout } from "../../store/slices/storageSlice";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userId = useSelector(s => s.storage.userId);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => setOpen(false), [location]);

  const logout = () => { dispatch(authLogout()); toast.success("Logged out!"); navigate("/"); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const links = [
    { to: "/", label: "Home" },
    { to: "/movies", label: "Movies" },
    { to: "/theaters", label: "Theaters" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-black"><span className="text-white">CINE</span><span className="text-red-500">MAX</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to) && to !== "/" || location.pathname === to ? "bg-red-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {userId ? (
              <>
                {isAdmin && <Link to="/admin" className="px-3 py-2 text-sm text-yellow-400 hover:text-yellow-300 font-semibold">Admin ⚙️</Link>}
                <Link to="/profile" className="px-3 py-2 text-sm text-gray-300 hover:text-white">My Profile</Link>
                <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white">Login</Link>
                <Link to="/signup" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">Sign Up</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10">
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, label }) => (
                <Link key={to} to={to} className={`block px-4 py-3 rounded-lg text-sm font-medium ${location.pathname === to ? "bg-red-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}>{label}</Link>
              ))}
              <div className="border-t border-white/10 pt-3 mt-2 space-y-1">
                {userId ? (
                  <>
                    {isAdmin && <Link to="/admin" className="block px-4 py-3 rounded-lg text-sm text-yellow-400">Admin Panel</Link>}
                    <Link to="/profile" className="block px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/10">My Profile</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-white/10">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/10">Login</Link>
                    <Link to="/signup" className="block px-4 py-3 text-center bg-red-600 text-white text-sm font-semibold rounded-lg">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
