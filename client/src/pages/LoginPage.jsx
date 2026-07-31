import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { authAPI } from "../api";
import { authLogin } from "../store/slices/storageSlice";

const LoginPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      dispatch(authLogin({ userId: data.userId, accessToken: data.accessToken, refreshToken: data.refreshToken, isAdmin: data.isAdmin }));
      toast.success(`Welcome back! 🎬`);
      navigate(data.isAdmin ? "/admin" : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-4xl font-black"><span className="text-white">CINE</span><span className="text-red-500">MAX</span></span>
          </Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" autoComplete="email" required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} name="password" value={form.password} onChange={handle} placeholder="••••••••" autoComplete="current-password" required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className={`w-full py-3.5 font-bold rounded-xl text-white text-lg transition-all ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30"}`}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span>
                : "Sign In"}
            </motion.button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-blue-300 text-xs space-y-1">
            <p className="font-semibold">🧪 Demo Accounts:</p>
            <p>Admin: <code className="bg-blue-900/40 px-1 rounded">admin@cinemax.ph</code> / <code className="bg-blue-900/40 px-1 rounded">Admin@123</code></p>
            <p>User: <code className="bg-blue-900/40 px-1 rounded">user@cinemax.ph</code> / <code className="bg-blue-900/40 px-1 rounded">User@1234</code></p>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
