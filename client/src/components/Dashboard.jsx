import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Bell, ClipboardList, LogOut, PackageCheck, PieChart as PieChartIcon, SunMoon, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'guest';
  
  const [dashboardData, setDashboardData] = useState({
    products: [],
    lowStockProducts: [],
    stats: {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    },
    stockTrends: [],
    notifications: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, lowStockRes, notificationsRes] = await Promise.all([
        fetch('/api/inventory/products', { credentials: 'include' }),
        fetch('/api/inventory/low-stock', { credentials: 'include' }),
        fetch('/api/notifications?unreadOnly=true&limit=5', { credentials: 'include' })
      ]);

      if (!productsRes.ok || !lowStockRes.ok || !notificationsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const productsData = await productsRes.json();
      const lowStockData = await lowStockRes.json();
      const notificationsData = await notificationsRes.json();

      // Calculate statistics
      const products = productsData.products || [];
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price || 0) * (product.currentStock || product.stock || 0)), 0);
      const lowStockCount = lowStockData.summary?.lowStock || 0;
      const outOfStockCount = lowStockData.summary?.outOfStock || 0;

      // Generate mock stock trends data (in real implementation, this would come from historical data)
      const stockTrends = generateMockTrends();

      setDashboardData({
        products,
        lowStockProducts: lowStockData.products || [],
        stats: {
          totalProducts,
          totalValue,
          lowStockCount,
          outOfStockCount
        },
        stockTrends,
        notifications: notificationsData.notifications || []
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      inStock: Math.floor(Math.random() * 100) + 50,
      lowStock: Math.floor(Math.random() * 20) + 5,
      outOfStock: Math.floor(Math.random() * 10) + 1
    }));
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'good': return 'Good Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const stockDistribution = [
    { name: 'Good Stock', value: dashboardData.stats.totalProducts - dashboardData.stats.lowStockCount - dashboardData.stats.outOfStockCount, color: '#10b981' },
    { name: 'Low Stock', value: dashboardData.stats.lowStockCount, color: '#f59e0b' },
    { name: 'Out of Stock', value: dashboardData.stats.outOfStockCount, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] p-6 space-y-6 hidden md:block">
        <h2 className="text-2xl font-bold">RePack</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-3 text-blue-400 font-semibold">
            <PieChartIcon className="w-5 h-5" /> Dashboard
          </Link>

          {(role === 'admin' || role === 'staff') && (
            <Link to="/products" className="flex items-center gap-3 text-white hover:text-blue-400">
              <PackageCheck className="w-5 h-5" /> Products
            </Link>
          )}

          {role === 'admin' && (
            <Link to="/alerts" className="flex items-center gap-3 text-white hover:text-blue-400">
              <Bell className="w-5 h-5" /> Alerts
              {dashboardData.notifications.length > 0 && (
                <span className="bg-red-500 text-xs rounded-full px-2 py-1 ml-auto">
                  {dashboardData.notifications.length}
                </span>
              )}
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

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Inventory Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name || 'User'}</p>
          </div>
          <div className="flex items-center gap-4">
            {dashboardData.notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-yellow-400" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {dashboardData.notifications.length}
                </span>
              </div>
            )}
            <button className="bg-[#1e293b] text-white px-3 py-1 rounded hover:bg-[#334155] flex items-center gap-2">
              <SunMoon className="w-5 h-5" /> Toggle Mode
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#4f46e5] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{dashboardData.stats.totalProducts}</h2>
                <p className="text-sm opacity-90">Total Products</p>
              </div>
              <PackageCheck className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-[#0284c7] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">${dashboardData.stats.totalValue.toFixed(0)}</h2>
                <p className="text-sm opacity-90">Total Inventory Value</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-[#f59e0b] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{dashboardData.stats.lowStockCount}</h2>
                <p className="text-sm opacity-90">Low Stock Items</p>
              </div>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-[#dc2626] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{dashboardData.stats.outOfStockCount}</h2>
                <p className="text-sm opacity-90">Out of Stock</p>
              </div>
              <ShoppingCart className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stock Trends Chart */}
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Stock Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.stockTrends}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="inStock" stroke="#10b981" strokeWidth={2} name="In Stock" />
                <Line type="monotone" dataKey="lowStock" stroke="#f59e0b" strokeWidth={2} name="Low Stock" />
                <Line type="monotone" dataKey="outOfStock" stroke="#ef4444" strokeWidth={2} name="Out of Stock" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Distribution Pie Chart */}
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Stock Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {stockDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {dashboardData.lowStockProducts.length > 0 && (
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Products Requiring Attention
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="bg-[#334155] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold truncate">{product.name}</h4>
                    <div className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(product.stockStatus)} text-white`}>
                      {getStockStatusText(product.stockStatus)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">SKU: {product.sku}</p>
                  <div className="flex justify-between text-sm">
                    <span>Stock: {product.stockLevel}</span>
                    <span>Threshold: {product.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
            {dashboardData.lowStockProducts.length > 6 && (
              <div className="text-center mt-4">
                <Link to="/inventory/low-stock" className="text-blue-400 hover:text-blue-300">
                  View all {dashboardData.lowStockProducts.length} items →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Notifications */}
        {dashboardData.notifications.length > 0 && (
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-[#334155] rounded-lg">
                  <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/notifications" className="text-blue-400 hover:text-blue-300">
                View all notifications →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
