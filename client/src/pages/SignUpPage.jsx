import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { authAPI } from "../api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) { toast.error("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      await authAPI.signUp({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      toast.success("Account created! Please sign in. 🎬");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-4xl font-black"><span className="text-white">CINE</span><span className="text-red-500">MAX</span></span></Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[["firstName","First Name"],["lastName","Last Name"]].map(([name,label]) => (
                <div key={name}>
                  <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
                  <input type="text" name={name} value={form[name]} onChange={handle} required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
                </div>
              ))}
            </div>

            {[["email","Email","email","you@example.com"],["password","Password","password","Min. 6 characters"],["confirm","Confirm Password","password","Repeat password"]].map(([name,label,type,ph]) => (
              <div key={name}>
                <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
                <input type={type} name={name} value={form[name]} onChange={handle} placeholder={ph} required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
              </div>
            ))}

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className={`w-full py-3.5 font-bold rounded-xl text-white text-lg mt-2 transition-all ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30"}`}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span>
                : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
