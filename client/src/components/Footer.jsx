
import React from 'react';
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        <div>
          <h4 className="font-semibold text-white mb-3">Product</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white">Dashboard</a></li>
            <li><a href="#" className="hover:text-white">Stock Tracking</a></li>
            <li><a href="#" className="hover:text-white">Alerts</a></li>
            <li><a href="#" className="hover:text-white">Reports</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Features</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white">Low-stock Alerts</a></li>
            <li><a href="#" className="hover:text-white">Product Categories</a></li>
            <li><a href="#" className="hover:text-white">Live Dashboard</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Support</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Documentation</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Connect</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-white">LinkedIn</a></li>
            <li><a href="#" className="hover:text-white">Twitter</a></li>
            <li><a href="#" className="hover:text-white">GitHub</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SmartInventory — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

