import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black border-t border-gray-800 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-black mb-2"><span className="text-white">CINE</span><span className="text-red-500">MAX</span></div>
          <p className="text-gray-400 text-sm">The ultimate cinema experience. Book online, skip the queue.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            {[["Movies","/movies"],["Theaters","/theaters"],["Coming Soon","/movies"]].map(([l,t])=>(
              <li key={t}><Link to={t} className="text-gray-400 hover:text-red-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            {[["My Profile","/profile"],["Login","/login"],["Sign Up","/signup"]].map(([l,t])=>(
              <li key={t}><Link to={t} className="text-gray-400 hover:text-red-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-gray-400 text-sm">info@cinemax.ph</p>
          <p className="text-gray-400 text-sm mt-1">+63 2 8888 0000</p>
          <Link to="/contact" className="inline-block mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">Send Message</Link>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CineMax. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
