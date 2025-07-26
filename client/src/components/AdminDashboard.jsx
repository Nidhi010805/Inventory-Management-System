// src/pages/AdminDashboard.jsx
import React from 'react';
import { PackageCheck, Bell, Users, ClipboardList } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

export default function AdminDashboard() {
  const stats = [
    {
      icon: <PackageCheck size={24} />,
      label: 'Total Products',
      value: 120,
      change: '+5.2%',
      bg: 'bg-purple-600',
      chartColor: '#c084fc',
    },
    {
      icon: <Bell size={24} />,
      label: 'Low Stock Alerts',
      value: 8,
      change: '-12.1%',
      bg: 'bg-red-500',
      chartColor: '#f87171',
    },
    {
      icon: <Users size={24} />,
      label: 'Total Users',
      value: 5,
      change: '+2.8%',
      bg: 'bg-blue-600',
      chartColor: '#60a5fa',
    },
    {
      icon: <ClipboardList size={24} />,
      label: 'Inventory Logs',
      value: 320,
      change: '+9.4%',
      bg: 'bg-yellow-500',
      chartColor: '#facc15',
    },
  ];

  const generateChartData = (hexColor) => ({
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        label: '',
        data: [15, 22, 18, 30, 20, 27, 24],
        borderColor: hexColor,
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Diagonal Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-white clip-diagonal-light absolute top-0 left-0" />
        <div className="w-full h-full bg-[#0f172a] clip-diagonal-dark absolute top-0 left-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ icon, label, value, change, bg, chartColor }) => (
          <div key={label} className={`rounded-xl p-4 text-white shadow-lg ${bg}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold opacity-80">{label}</h3>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs mt-1 opacity-75">
                  {change.includes('-') ? (
                    <span className="text-red-300">{change} ↓</span>
                  ) : (
                    <span className="text-green-200">{change} ↑</span>
                  )}
                </p>
              </div>
              <div className="opacity-80">{icon}</div>
            </div>
            <div className="mt-3 h-12">
              <Line
                data={generateChartData(chartColor)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
