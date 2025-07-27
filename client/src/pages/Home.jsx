import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../components/utils/motionVariants";

const steps = [
  { title: "Purchase Product", emoji: "🛍️" },
  { title: "Scan QR Code", emoji: "📱" },
  { title: "Return Packaging", emoji: "🔄" },
  { title: "Earn Rewards", emoji: "🎁" },
];

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white shadow hover:shadow-xl transition rounded-xl p-6 text-center border border-gray-200">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const Home = () => {
  return (
    <div className="bg-white text-gray-800 min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gray-50 text-gray-800 px-6 md:px-20 py-24">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
    
    {/* Left Content */}
    <motion.div
      variants={fadeIn("left", 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="flex-1"
    >
      <span className="text-sm uppercase text-gray-500 font-semibold tracking-wide">
        Your Intelligent Inventory Partner
      </span>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
        SmartInventory<br />Manage Smarter
      </h1>
      <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
        A smart and secure inventory platform that helps you monitor products in real-time, get low-stock alerts, and manage roles efficiently.
      </p>
      <Link to="/signup">
        <button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg text-lg font-semibold transition shadow-lg">
          Get Started
        </button>
      </Link>
    </motion.div>

    {/* Right Image */}
    <motion.div
      variants={fadeIn("right", 0.4)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="flex-1"
    >
      <img
        src="https://via.placeholder.com/600x450"
        alt="Smart Inventory"
        className="rounded-2xl drop-shadow-lg w-full max-w-md md:max-w-full hover:scale-105 transition-transform duration-300"
      />
    </motion.div>
  </div>
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
    </div>
  );
};

export default Home;
