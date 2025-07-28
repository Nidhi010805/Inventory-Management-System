import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import axiosClient from '../api/axiosClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const COLORS = ["#4ade80", "#22d3ee", "#fbbf24", "#f87171", "#a78bfa", "#f472b6"];

const Analytics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [processedActivity, setProcessedActivity] = useState([]);

  const processRecentActivity = (data) => {
    const map = {};
    data.forEach(item => {
      const dateStr = new Date(item.updatedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      if (!map[dateStr]) map[dateStr] = 0;
      map[dateStr] += item.stock || 0;
    });
    return Object.entries(map)
      .map(([date, stock]) => ({ date, stock }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);
const handleLogsExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    recentActivity.map(item => ({
      Name: item.name,
      Stock: item.stock,
      "Last Updated": new Date(item.updatedAt).toLocaleString(),
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
  XLSX.writeFile(workbook, "ActivityLogs.xlsx");
};

const handleLogsPDF = async () => {
  const input = document.getElementById("activity-table");
  if (!input) return;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 10, width, height);
  pdf.save("ActivityLogs.pdf");
};

  const fetchAnalytics = async () => {
    try {
      const [categoryRes, lowStockRes, activityRes] = await Promise.all([
        axiosClient.get('/products/analytics/category-count'),
        axiosClient.get('/products/analytics/low-stock-count'),
        axiosClient.get('/products/analytics/recent-activity'),
      ]);

      setCategoryData(categoryRes.data || []);
      setLowStockCount(lowStockRes.data?.count || 0);
      setRecentActivity(activityRes.data || []);
      setProcessedActivity(processRecentActivity(activityRes.data || []));
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  return (
    <div className="p-6 space-y-12 text-gray-100 bg-gray-900 rounded-lg shadow-lg max-w-6xl mx-auto">
      <section>
        <h2 className="text-2xl font-semibold mb-6">Category-wise Product Count</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
              fill="#8884d8"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
              itemStyle={{ color: '#bbf7d0' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Low Stock Count</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={[{ name: "Low Stock", count: lowStockCount }]}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#9ca3af', fontWeight: '600' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#9ca3af', fontWeight: '600' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
              itemStyle={{ color: '#f87171', fontWeight: '600' }}
            />
            <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Recent Activity (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={processedActivity} margin={{ top: 0, right: 40, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontWeight: '600' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#9ca3af', fontWeight: '600' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
              itemStyle={{ color: '#8884d8', fontWeight: '600' }}
            />
            <Area
              type="monotone"
              dataKey="stock"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>

<div className="flex justify-end gap-4 my-4">
  <button
    onClick={handleLogsExcel}
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  >
    Export Logs Excel
  </button>
  <button
    onClick={handleLogsPDF}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Export Logs PDF
  </button>
</div>

        <div  id="activity-table" className="mt-8 max-h-56 overflow-y-auto rounded-md border border-gray-700 bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="py-2 px-4 text-gray-300 font-semibold">Product Name</th>
                <th className="py-2 px-4 text-gray-300 font-semibold">Stock</th>
                <th className="py-2 px-4 text-gray-300 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                    No recent activity found
                  </td>
                </tr>
              )}
              {recentActivity.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150 cursor-default"
                >
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.stock}</td>
                  <td className="py-2 px-4">{new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
