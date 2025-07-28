import React from 'react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 pt-10 pb-6 mt-20 shadow-inner border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        {/* Product */}
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-wide">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/Dashboard" className="hover:text-cyan-400 transition">Dashboard</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Stock Tracking</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Alerts</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Reports</a></li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-wide">Features</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition">Low-stock Alerts</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Categories</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Live Dashboard</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition">About Us</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Careers</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition">Help Center</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Docs</a></li>
          </ul>
        </div>

        {/* Social / Connect */}
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-wide">Connect</h4>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-cyan-400 transition"><FaLinkedin /></a>
            <a href="#" className="hover:text-cyan-400 transition"><FaTwitter /></a>
            <a href="#" className="hover:text-cyan-400 transition"><FaGithub /></a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} <span className="text-cyan-400 font-medium">SmartInventory</span> — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
