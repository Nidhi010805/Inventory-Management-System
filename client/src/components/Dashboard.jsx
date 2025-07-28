import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Bell, ClipboardList, LogOut, PackageCheck, PieChart, SunMoon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const data = [
  { month: 'Jan', stock: 120, added: 50 },
  { month: 'Feb', stock: 100, added: 30 },
  { month: 'Mar', stock: 140, added: 70 },
  { month: 'Apr', stock: 90, added: 60 },
  { month: 'May', stock: 160, added: 90 },
  { month: 'Jun', stock: 130, added: 40 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'guest'; 

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <aside className="w-64 bg-[#1e293b] p-6 space-y-6 hidden md:block">
        <h2 className="text-2xl font-bold">RePack</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-3 text-white hover:text-blue-400">
            <PieChart className="w-5 h-5" /> Dashboard
          </Link>

          {(role === 'admin' || role === 'staff') && (
            <Link to="/products" className="flex items-center gap-3 text-white hover:text-blue-400">
              <PackageCheck className="w-5 h-5" /> Products
            </Link>
          )}

          {role === 'admin' && (
            <Link to="/alerts" className="flex items-center gap-3 text-white hover:text-blue-400">
              <Bell className="w-5 h-5" /> Alerts
            </Link>
          )}

          {(role === 'admin' || role === 'staff') && (
            <Link to="/logs" className="flex items-center gap-3 text-white hover:text-blue-400">
              <ClipboardList className="w-5 h-5" /> Logs
            </Link>
          )}

          <Link to="/logout" className="flex items-center gap-3 text-white hover:text-red-400">
            <LogOut className="w-5 h-5" /> Logout
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Inventory Dashboard</h1>
          <button className="bg-[#1e293b] text-white px-3 py-1 rounded hover:bg-[#334155] flex items-center gap-2">
            <SunMoon className="w-5 h-5" /> Toggle Mode
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#4f46e5] p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold">26K</h2>
            <p className="text-sm">Total Products</p>
          </div>
          <div className="bg-[#0284c7] p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold">$6.2K</h2>
            <p className="text-sm">Monthly Added</p>
          </div>
          <div className="bg-[#f59e0b] p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold">2.49%</h2>
            <p className="text-sm">Low Stock Rate</p>
          </div>
          <div className="bg-[#dc2626] p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold">44K</h2>
            <p className="text-sm">Total Users</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Stock Overview</h2>
          <div className="flex gap-2">
            <button className="bg-[#1e293b] text-white px-3 py-1 rounded hover:bg-[#334155]">Day</button>
            <button className="bg-[#1e293b] text-white px-3 py-1 rounded hover:bg-[#334155]">Month</button>
            <button className="bg-[#1e293b] text-white px-3 py-1 rounded hover:bg-[#334155]">Year</button>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl shadow">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="added" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
