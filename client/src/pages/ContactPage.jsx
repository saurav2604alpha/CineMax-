import { motion } from "framer-motion";
import ContactForm from "../components/contact/ContactForm";

const INFO = [
  { icon: "📍", title: "Address", lines: ["123 Cinema Drive", "Manila, Philippines"] },
  { icon: "📞", title: "Phone", lines: ["+63 2 8888 0000", "Mon–Sun: 10am–11pm"] },
  { icon: "📧", title: "Email", lines: ["info@cinemax.ph", "support@cinemax.ph"] },
  { icon: "🕐", title: "Hours", lines: ["Monday–Friday: 10am–12am", "Saturday–Sunday: 9am–12am"] },
];

const ContactPage = () => (
  <div className="min-h-screen bg-gray-950 pt-20 pb-16">
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4 mb-8 border-b border-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-black text-white">Contact <span className="text-red-500">Us</span></h1>
        <p className="text-gray-400 mt-2">We'd love to hear from you. Send us a message!</p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-5">Get in Touch</h2>
            <div className="space-y-5">
              {INFO.map(({ icon, title, lines }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    {lines.map(l => <p key={l} className="text-gray-400 text-sm">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map embed placeholder */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-2">🗺️</p>
                <p className="text-sm">Manila, Philippines</p>
                <a href="https://maps.google.com/?q=Manila" target="_blank" rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 text-xs mt-1 inline-block">Open in Google Maps →</a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4">Quick Answers</h3>
            <div className="space-y-3">
              {[
                ["How do I cancel a booking?", "Log in, go to My Profile → Bookings, and click Cancel."],
                ["Is there a refund policy?", "Full refunds are available up to 2 hours before showtime."],
                ["Can I change my seats?", "Contact us at least 3 hours before the show."],
              ].map(([q, a]) => (
                <div key={q} className="text-sm">
                  <p className="text-white font-medium">{q}</p>
                  <p className="text-gray-400 mt-0.5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <ContactForm />
        </motion.div>
      </div>
    </div>
  </div>
);

export default ContactPage;
