import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen pt-20 px-6 md:px-20">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400"
      >
        About SmartInventory
      </motion.h1>

      {/* Introduction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl mt-6 text-center max-w-3xl mx-auto text-gray-300"
      >
        At SmartInventory, we revolutionize the way businesses manage their inventory. Our intelligent system offers real-time updates, smart alerts, and detailed analytics that empower business decisions.
      </motion.p>

      {/* Mission, Features, Impact */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Mission */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-teal-500/20 transition"
        >
          <h3 className="text-xl font-semibold text-teal-400 mb-3">Our Mission</h3>
          <p className="text-gray-400">
            To provide businesses of all sizes with an efficient, intuitive, and reliable platform to manage and optimize inventory operations effortlessly.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/20 transition"
        >
          <h3 className="text-xl font-semibold text-purple-400 mb-3">Key Features</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>Real-time Stock Tracking</li>
            <li>Low-stock Smart Alerts</li>
            <li>Analytics & Reporting</li>
            <li>Live Dashboard & Insights</li>
          </ul>
        </motion.div>

        {/* Impact */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-pink-500/20 transition"
        >
          <h3 className="text-xl font-semibold text-pink-400 mb-3">Our Impact</h3>
          <p className="text-gray-400">
            Over 100+ businesses have streamlined their inventory with SmartInventory, reducing losses and enhancing operational efficiency.
          </p>
        </motion.div>
      </div>

      {/* Closing */}
      <div className="text-center mt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-sm"
        >
          Together, let’s build smarter supply chains.
        </motion.p>
      </div>
    </div>
  );
};

export default About;
