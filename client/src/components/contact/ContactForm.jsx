import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { contactAPI } from "../../api";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) { toast.error("Please enter a valid email address."); return; }
    if (form.message.trim().length < 10) { toast.error("Message must be at least 10 characters."); return; }

    setLoading(true);
    try {
      const { data } = await contactAPI.submit(form);
      toast.success(data.message || "Message sent successfully!");
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6 bg-gray-900 rounded-2xl border border-gray-800">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
      <p className="text-gray-400 mb-6">We'll get back to you within 24 hours.</p>
      <button onClick={() => setSubmitted(false)}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
        Send Another Message
      </button>
    </motion.div>
  );

  return (
    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-6 lg:p-8 space-y-5">
      <h2 className="text-2xl font-black text-white">Send us a <span className="text-red-500">Message</span></h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
          <input name="name" value={form.name} onChange={handle} placeholder="John Doe" required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
          <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
        <input name="subject" value={form.subject} onChange={handle} placeholder="General Inquiry"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Message <span className="text-red-500">*</span></label>
        <textarea name="message" value={form.message} onChange={handle} rows={5} placeholder="Tell us how we can help..." required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none" />
        <p className="text-gray-500 text-xs mt-1">{form.message.length} characters</p>
      </div>

      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
        className={`w-full py-3.5 font-bold rounded-xl text-white transition-all text-lg ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30"}`}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </span>
        ) : "📩 Send Message"}
      </motion.button>
    </motion.form>
  );
};

export default ContactForm;
