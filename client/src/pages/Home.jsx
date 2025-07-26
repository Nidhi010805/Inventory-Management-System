import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-white to-white text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white sticky top-0 z-50">
        <div className="text-2xl font-bold text-green-600">ReLoop</div>
        <div className="space-x-6">
          <Link to="/" className="hover:text-green-500">Home</Link>
          <Link to="/about" className="hover:text-green-500">About</Link>
          <Link to="/contact" className="hover:text-green-500">Contact</Link>
          <Link to="/login">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 leading-tight">
            Join the Circular Revolution ♻️
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Return packaging, earn rewards, and reduce waste. ReLoop connects users with stores for seamless packaging return and a greener tomorrow.
          </p>
          <Link to="/signup">
            <button className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition">
              Get Started
            </button>
          </Link>
        </div>

        {/* Image */}
        <div className="mt-10 md:mt-0">
          <img
            src="/images/hero-reloop.png"
            alt="ReLoop Packaging"
            className="w-full max-w-md mx-auto drop-shadow-xl"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 px-8 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-green-700">How ReLoop Works</h2>
        <div className="grid md:grid-cols-4 gap-10">
          {[
            { title: 'Purchase Product', emoji: '🛍️' },
            { title: 'Scan QR Code', emoji: '📱' },
            { title: 'Return Packaging', emoji: '🔄' },
            { title: 'Earn Rewards', emoji: '🎁' },
          ].map((step, i) => (
            <div key={i} className="bg-green-50 rounded-xl shadow p-6 text-center hover:shadow-md transition">
              <div className="text-4xl mb-4">{step.emoji}</div>
              <h3 className="text-xl font-semibold text-green-800">{step.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-100 text-center py-6 text-gray-600 mt-12">
        © 2025 ReLoop. Made with ❤️ for sustainability.
      </footer>
    </div>
  );
};

export default Home;
