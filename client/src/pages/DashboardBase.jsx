import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageCheck,
  Bell,
  ClipboardList,
  LogOut,
  UserCircle,
  Moon,
  BellRing,
  Settings,
} from 'lucide-react';

export default function DashboardBase({ role }) {
  const location = useLocation();

  const sidebarSections = [
    {
      title: 'Dashboard',
      links: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: `/${role}/dashboard` },
      ],
    },
    {
      title: 'Inventory',
      links: [
        { icon: <PackageCheck size={18} />, label: 'Products', href: `/${role}/products` },
        ...(role === 'admin'
          ? [{ icon: <Bell size={18} />, label: 'Alerts', href: `/${role}/alerts` }]
          : []),
        { icon: <ClipboardList size={18} />, label: 'Logs', href: `/${role}/logs` },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] flex flex-col justify-between p-4 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 px-2">InventorySys</h2>

          {/* Sidebar Sections */}
          <nav className="flex flex-col gap-6">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs uppercase text-gray-400 mb-2 px-2 tracking-wide">
                  {section.title}
                </p>
                {section.links.map(({ icon, label, href }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={label}
                      to={href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {icon}
                      <span className="text-sm">{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900 px-4 py-2 rounded-md transition"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col bg-[#0f172a]">
        {/* Top Navbar */}
        <header className="h-16 bg-[#1e293b] flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-white">
            {role === 'admin' ? 'Admin' : 'Staff'} Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <BellRing size={18} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Moon size={18} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Settings size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <UserCircle size={20} />
            </div>
          </div>
        </header>

        {/* Outlet content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
