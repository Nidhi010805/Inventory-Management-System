import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../components/utils/motionVariants";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

// Step-by-step section data
const steps = [
  { title: "Purchase Product", emoji: "🛍️" },
  { title: "Scan QR Code", emoji: "📱" },
  { title: "Return Packaging", emoji: "🔄" },
  { title: "Earn Rewards", emoji: "🎁" },
];

// Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white shadow hover:shadow-xl transition rounded-xl p-6 text-center border border-gray-200">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const HomePage = () => {
  return (
    <div className="bg-white text-gray-800 min-h-screen font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 70 }}
        className="flex justify-between items-center px-6 py-4 shadow-md bg-white/80 backdrop-blur sticky top-0 z-50"
      >
        <div className="text-3xl font-extrabold text-green-600 tracking-wide">ReLoop</div>
        <div className="space-x-6 text-sm md:text-base">
          <Link to="/" className="hover:text-green-600 font-medium">Home</Link>
          <Link to="/about" className="hover:text-green-600 font-medium">About</Link>
          <Link to="/contact" className="hover:text-green-600 font-medium">Contact</Link>
          <Link to="/login">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold">
              Login
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-24 gap-16 md:gap-12">
        <motion.div
          variants={fadeIn("left", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-green-700 leading-tight"
          >
            Join the Circular <br /> Revolution ♻️
          </motion.h1>
          <p className="mt-6 text-lg text-gray-600">
            Return packaging, earn rewards, and reduce waste. ReLoop connects users with stores for seamless packaging return and a greener tomorrow.
          </p>
          <Link to="/signup">
            <button className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition font-medium shadow-md">
              Get Started
            </button>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeIn("right", 0.4)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="w-full max-w-md"
        >
          <img
            src="https://via.placeholder.com/400x300" // Use placeholder or local image
            alt="ReLoop Packaging"
            className="rounded-xl drop-shadow-xl hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 px-6 md:px-20">
        <motion.h2
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-14 text-green-700"
        >
          How ReLoop Works
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 md:grid-cols-4 gap-8"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeIn("up", i * 0.2)}
              className="bg-white/70 backdrop-blur-md border border-green-100 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h3 className="text-xl font-semibold text-green-800">{step.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Build</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A real-time platform with smart dashboards, alerting systems, analytics and secure role-based access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <FeatureCard icon="📊" title="Product Dashboard" desc="Categorize items and monitor live stock levels with clean UI." />
          <FeatureCard icon="🔔" title="Instant Alerts" desc="Get notified when items hit reorder levels via browser, email or Slack." />
          <FeatureCard icon="🔐" title="Role-Based Login" desc="Admins and Staff get separate secure access and permissions." />
          <FeatureCard icon="📈" title="Data Visualizations" desc="Interactive charts for better stock and sales analysis." />
          <FeatureCard icon="📦" title="Inventory Logs" desc="Keep record of product moves: additions, deletions, transfers." />
          <FeatureCard icon="💻" title="Built with Modern Stack" desc="React.js, Node/Django, PostgreSQL, Chart.js — SaaS ready." />
        </div>
      </section>

      {/* Footer */}
      <motion.footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-3">RePack-GreenChain</h2>
            <p className="text-sm text-gray-400">
              Empowering eco-friendly packaging and sustainable logistics for a greener tomorrow.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-300">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-green-400 transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-300">Connect with Us</h3>
            <div className="flex justify-center md:justify-start gap-4 text-lg">
              <a href="https://facebook.com" className="hover:text-blue-500 transition"><FaFacebookF /></a>
              <a href="https://twitter.com" className="hover:text-blue-400 transition"><FaTwitter /></a>
              <a href="https://instagram.com" className="hover:text-pink-500 transition"><FaInstagram /></a>
              <a href="https://linkedin.com" className="hover:text-blue-600 transition"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
