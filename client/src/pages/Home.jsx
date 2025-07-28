"use client";
import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../components/utils/motionVariants";
import {
  FaBoxOpen,
  FaBell,
  FaUserShield,
  FaChartBar,
  FaCubes,
  FaCode,
} from "react-icons/fa";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-black/40 shadow-lg hover:shadow-xl transition rounded-2xl p-6 text-center border border-gray-700 backdrop-blur-md"
  >
    <div className="text-5xl text-indigo-500 mb-4 flex justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300 text-sm">{desc}</p>
  </motion.div>
);

const Home = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gray-900 text-white min-h-screen">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          particles: {
            number: { value: 90 },
            size: { value: 3 },
            color: { value: "#00ffff" },
            links: {
              enable: true,
              color: "#00ffff",
              distance: 150,
              opacity: 0.3,
              width: 1,
            },
            move: { enable: true, speed: 1.5 },
          },
        }}
      />

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 bg-black/40 p-8 rounded-3xl backdrop-blur-lg shadow-xl"
        >
          {/* Left Content */}
          <motion.div variants={fadeIn("left", 0.3)} className="flex-1">
            <span className="text-sm uppercase tracking-widest text-indigo-300 font-semibold">
              Your Intelligent Inventory Partner
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mt-4 mb-6">
              SmartInventory
              <br />
              <span className="text-indigo-400">Manage Smarter</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8">
              A smart, secure and responsive inventory management platform for
              modern teams — real-time alerts, role-based dashboards, and
              analytics.
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Image */}
          <motion.div variants={fadeIn("right", 0.5)} className="flex-1">
            <img
              src="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
              alt="Smart Inventory"
              className="rounded-3xl drop-shadow-2xl w-full hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-lg z-0" />

        <div className="relative max-w-6xl mx-auto text-center mb-16 z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Platform Highlights
          </h2>
          <p className="text-indigo-200 mt-4 max-w-2xl mx-auto text-md font-light">
            Delivering clarity, control, and confidence with every stocked item.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto z-10">
          <FeatureCard
            icon={<FaBoxOpen />}
            title="Product Dashboard"
            desc="Categorize items and monitor live stock levels with a clean, real-time UI."
          />
          <FeatureCard
            icon={<FaBell />}
            title="Instant Alerts"
            desc="Reorder triggers and low-stock warnings via browser, email, or Slack."
          />
          <FeatureCard
            icon={<FaUserShield />}
            title="Role-Based Login"
            desc="Granular control with secure admin/staff level access and permissions."
          />
          <FeatureCard
            icon={<FaChartBar />}
            title="Data Visualizations"
            desc="Real-time charts and KPIs for better decision-making and tracking."
          />
          <FeatureCard
            icon={<FaCubes />}
            title="Inventory Logs"
            desc="Automatic logging of inventory changes including additions, deletions, and transfers."
          />
          <FeatureCard
            icon={<FaCode />}
            title="Modern Tech Stack"
            desc="Built with React, Express/Django, PostgreSQL, Chart.js, and Tailwind — SaaS ready."
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
