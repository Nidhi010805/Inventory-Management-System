import React from "react";

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
    <div className="bg-white text-gray-800">

      {/* Hero Section */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-16">

          {/* Left Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Smarter Inventory <br className="hidden md:block" /> Management Starts Here
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md">
              Track stock in real-time, avoid shortages, and get actionable insights with our powerful and easy-to-use inventory platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium shadow-md transition">
                Try for Free
              </button>
              <button className="border border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-md text-base font-medium transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="md:w-1/2">
            <img
              src="/assets/dashboard-preview.png" // Replace with real path
              alt="Inventory Dashboard Preview"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* What You'll Build */}
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

export default HomePage;
